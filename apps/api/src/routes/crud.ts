import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { connectionManager } from '../services/ConnectionManager.js';

const FindSchema = z.object({
  db: z.string(),
  coll: z.string(),
  filter: z.any().default({}),
  projection: z.any().optional(),
  sort: z.any().optional(),
  skip: z.number().int().nonnegative().default(0),
  limit: z.number().int().positive().max(500).default(50),
});

const InsertOneSchema = z.object({ db: z.string(), coll: z.string(), doc: z.any() });
const UpdateOneSchema = z.object({ db: z.string(), coll: z.string(), filter: z.any(), update: z.any(), options: z.any().optional() });
const DeleteOneSchema = z.object({ db: z.string(), coll: z.string(), filter: z.any() });

export async function crudRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request, reply) => {
    try {
      // @ts-ignore
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  app.post('/:sessionId/find', async (req) => {
    const { sessionId } = req.params as { sessionId: string };
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const body = FindSchema.parse(req.body);
    const cursor = client
      .db(body.db)
      .collection(body.coll)
      .find(body.filter, { projection: body.projection, sort: body.sort, skip: body.skip, limit: body.limit });
    const docs = await cursor.toArray();
    return { docs };
  });

  app.post('/:sessionId/insertOne', async (req) => {
    const { sessionId } = req.params as { sessionId: string };
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const body = InsertOneSchema.parse(req.body);
    const res = await client.db(body.db).collection(body.coll).insertOne(body.doc);
    return { insertedId: res.insertedId };
  });

  app.post('/:sessionId/updateOne', async (req) => {
    const { sessionId } = req.params as { sessionId: string };
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const body = UpdateOneSchema.parse(req.body);
    const res = await client
      .db(body.db)
      .collection(body.coll)
      .updateOne(body.filter, body.update, body.options ?? {});
    return { matchedCount: res.matchedCount, modifiedCount: res.modifiedCount, upsertedId: res.upsertedId };
  });

  app.post('/:sessionId/deleteOne', async (req) => {
    const { sessionId } = req.params as { sessionId: string };
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const body = DeleteOneSchema.parse(req.body);
    const res = await client.db(body.db).collection(body.coll).deleteOne(body.filter);
    return { deletedCount: res.deletedCount };
  });
}


