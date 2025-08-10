import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { connectionManager } from '../services/ConnectionManager.js';
import { Readable } from 'node:stream';
import * as readline from 'node:readline';

export async function transferRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.post('/:sessionId/export', async (req, reply) => {
    const { sessionId } = req.params as { sessionId: string };
    const body = z
      .object({ db: z.string(), coll: z.string(), filter: z.any().optional(), format: z.enum(['jsonl', 'csv']).default('jsonl') })
      .parse(req.body);
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const cursor = client.db(body.db).collection(body.coll).find(body.filter ?? {});
    if (body.format === 'jsonl') {
      reply.header('Content-Type', 'application/x-ndjson');
      reply.header('Content-Disposition', `attachment; filename="${body.db}.${body.coll}.jsonl"`);
      const stream = Readable.from((async function* () {
        for await (const doc of cursor) {
          yield JSON.stringify(doc) + '\n';
        }
      })());
      return reply.send(stream);
    }
    // CSV simplificado: serializa claves del primer doc
    const docs = await cursor.toArray();
    const headers = Array.from(new Set(docs.flatMap((d) => Object.keys(d))));
    const rows = [headers.join(','), ...docs.map((d) => headers.map((h) => JSON.stringify((d as any)[h] ?? '')).join(','))];
    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', `attachment; filename="${body.db}.${body.coll}.csv"`);
    return rows.join('\n');
  });

  app.post('/:sessionId/import', async (req) => {
    const { sessionId } = req.params as { sessionId: string };
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const mp = await req.file();
    if (!mp) throw new Error('Fichero requerido');
    const fields = req.body as any;
    const db = fields.db as string;
    const coll = fields.coll as string;
    const preview = fields.preview === 'true';

    if (mp.mimetype === 'application/x-ndjson' || mp.filename?.endsWith('.jsonl')) {
      const rl = readline.createInterface({ input: mp.file });
      const batch: any[] = [];
      const first: any[] = [];
      for await (const line of rl) {
        if (!line.trim()) continue;
        const doc = JSON.parse(line);
        if (preview) {
          if (first.length < 20) first.push(doc);
        } else {
          batch.push(doc);
          if (batch.length >= 1000) {
            await client.db(db).collection(coll).insertMany(batch);
            batch.length = 0;
          }
        }
      }
      if (!preview && batch.length) await client.db(db).collection(coll).insertMany(batch);
      return preview ? { preview: first } : { ok: true };
    }
    throw new Error('Formato no soportado (usa JSONL)');
  });
}


