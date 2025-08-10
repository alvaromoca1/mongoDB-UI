import type { FastifyInstance } from 'fastify';
import { connectionManager } from '../services/ConnectionManager.js';
import { z } from 'zod';

export async function dbRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request, reply) => {
    try {
      // @ts-ignore
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  app.get('/:sessionId/databases', async (req) => {
    const { sessionId } = req.params as { sessionId: string };
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const list = await client.db().admin().listDatabases({ nameOnly: false });
    return list.databases;
  });

  app.get('/:sessionId/databases/:db/collections', async (req) => {
    const { sessionId, db } = req.params as { sessionId: string; db: string };
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const cols = await client.db(db).listCollections().toArray();
    return cols;
  });

  app.post('/:sessionId/databases', async (req) => {
    const { sessionId } = req.params as { sessionId: string };
    const body = z.object({ name: z.string().min(1) }).parse(req.body);
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    await client.db(body.name).createCollection('_init');
    await client.db(body.name).collection('_init').drop();
    return { name: body.name };
  });

  app.delete('/:sessionId/databases/:dbName', async (req, reply) => {
    const { sessionId, dbName } = req.params as { sessionId: string; dbName: string };
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    await client.db(dbName).dropDatabase();
    reply.code(204).send();
  });

  app.post('/:sessionId/databases/:db/collections', async (req) => {
    const { sessionId, db } = req.params as { sessionId: string; db: string };
    const body = z.object({ name: z.string().min(1), options: z.any().optional() }).parse(req.body);
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    await client.db(db).createCollection(body.name, body.options);
    return { name: body.name };
  });

  app.delete('/:sessionId/databases/:db/collections/:coll', async (req, reply) => {
    const { sessionId, db, coll } = req.params as { sessionId: string; db: string; coll: string };
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    await client.db(db).collection(coll).drop();
    reply.code(204).send();
  });
}


