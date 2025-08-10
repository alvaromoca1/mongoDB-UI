import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { connectionManager } from '../services/ConnectionManager.js';

export async function indexRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request, reply) => {
    try {
      // @ts-ignore
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  app.get('/:sessionId/indexes', async (req) => {
    const { sessionId } = req.params as { sessionId: string };
    const { db, coll } = req.query as { db: string; coll: string };
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const idx = await client.db(db).collection(coll).indexes();
    return idx;
  });

  app.post('/:sessionId/indexes', async (req) => {
    const { sessionId } = req.params as { sessionId: string };
    const body = z
      .object({ db: z.string(), coll: z.string(), keys: z.record(z.number()), options: z.any().optional() })
      .parse(req.body);
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const name = await client.db(body.db).collection(body.coll).createIndex(body.keys as any, body.options);
    return { name };
  });

  app.delete('/:sessionId/indexes', async (req, reply) => {
    const { sessionId } = req.params as { sessionId: string };
    const body = z.object({ db: z.string(), coll: z.string(), name: z.string() }).parse(req.body);
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    await client.db(body.db).collection(body.coll).dropIndex(body.name);
    reply.code(204).send();
  });
}


