import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { connectionManager } from '../services/ConnectionManager.js';

export async function miscRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request, reply) => {
    try {
      // @ts-ignore
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  app.post('/:sessionId/aggregate', async (req) => {
    const { sessionId } = req.params as { sessionId: string };
    const body = z.object({ db: z.string(), coll: z.string(), pipeline: z.array(z.any()), allowDiskUse: z.boolean().optional() }).parse(req.body);
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const cursor = client.db(body.db).collection(body.coll).aggregate(body.pipeline, { allowDiskUse: body.allowDiskUse });
    const docs = await cursor.toArray();
    return { docs };
  });

  app.post('/:sessionId/explain', async (req) => {
    const { sessionId } = req.params as { sessionId: string };
    const body = z.object({ db: z.string(), coll: z.string(), filter: z.any().optional(), pipeline: z.array(z.any()).optional() }).parse(req.body);
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const coll = client.db(body.db).collection(body.coll);
    if (body.pipeline) {
      const explain = await coll.aggregate(body.pipeline).explain();
      return { explain };
    }
    const explain = await coll.find(body.filter ?? {}).explain();
    return { explain };
  });
}


