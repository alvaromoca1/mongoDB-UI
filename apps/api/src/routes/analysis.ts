import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { connectionManager } from '../services/ConnectionManager.js';

function walk(doc: any, prefix: string, out: Map<string, Record<string, number>>) {
  if (doc === null) {
    const key = prefix || '$root';
    out.set(key, { ...(out.get(key) || {}), null: (out.get(key)?.null || 0) + 1 });
    return;
  }
  const t = Array.isArray(doc) ? 'array' : typeof doc;
  const key = prefix || '$root';
  const map = out.get(key) || {};
  map[t] = (map[t] || 0) + 1;
  out.set(key, map);
  if (t === 'object' && !Array.isArray(doc)) {
    for (const [k, v] of Object.entries(doc)) {
      walk(v as any, prefix ? `${prefix}.${k}` : String(k), out);
    }
  }
  if (Array.isArray(doc)) {
    for (const v of doc) walk(v, `${prefix}[]`, out);
  }
}

export async function analysisRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/:sessionId/schema', async (req) => {
    const { sessionId } = req.params as { sessionId: string };
    const { db, coll } = req.query as { db: string; coll: string };
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const sample = await client.db(db).collection(coll).aggregate([{ $sample: { size: 200 } }]).toArray();
    const out = new Map<string, Record<string, number>>();
    for (const d of sample) walk(d, '', out);
    return Array.from(out.entries()).map(([path, types]) => ({ path, types }));
  });

  app.get('/:sessionId/stats', async (req) => {
    const { sessionId } = req.params as { sessionId: string };
    const { db, coll } = req.query as { db: string; coll?: string } as any;
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    if (coll) {
      const stats = await client.db(db).command({ collStats: coll });
      return stats as any;
    }
    const stats = await client.db(db).stats();
    return stats;
  });
}


