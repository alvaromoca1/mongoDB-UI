import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { connectionManager } from '../services/ConnectionManager.js';

const OpenSchema = z.object({ uri: z.string(), ssh: z.any().optional() });

export async function openByUri(uri: string, options?: any) {
  const sessionId = await connectionManager.open(uri, options?.ssh);
  return sessionId;
}

export async function sessionRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request, reply) => {
    try {
      // @ts-ignore
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  app.post('/connect/:sessionId/close', async (req, reply) => {
    const { sessionId } = req.params as { sessionId: string };
    const ok = await connectionManager.close(sessionId);
    reply.code(ok ? 204 : 404).send();
  });
}


