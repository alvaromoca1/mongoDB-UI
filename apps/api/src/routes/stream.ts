import type { FastifyInstance } from 'fastify';
import { connectionManager } from '../services/ConnectionManager.js';

export async function streamRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request, reply) => {
    try {
      // @ts-ignore
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  app.get('/:sessionId/changes/stream', async (req, reply) => {
    const { sessionId } = req.params as { sessionId: string };
    const { db, coll } = req.query as { db: string; coll: string };
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const collection = client.db(db).collection(coll);
    const changeStream = collection.watch([], { fullDocument: 'updateLookup' });

    // @ts-ignore - sse is provided by fastify-sse
    reply.sse({ data: JSON.stringify({ type: 'ready' }) });

    changeStream.on('change', (change) => {
      // @ts-ignore - sse is provided by fastify-sse
      reply.sse({ data: JSON.stringify({ type: 'change', change }) });
    });
    changeStream.on('error', (err) => {
      // @ts-ignore - sse is provided by fastify-sse
      reply.sse({ data: JSON.stringify({ type: 'error', message: err.message }) });
      changeStream.close().catch(() => {});
    });

    req.raw.on('close', () => {
      changeStream.close().catch(() => {});
    });
  });
}


