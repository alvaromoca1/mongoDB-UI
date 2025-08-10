import type { FastifyInstance } from 'fastify';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { encryptString, decryptString } from '../lib/crypto.js';
import { MongoClient } from 'mongodb';

type StoredConnection = {
  id: string;
  name: string;
  createdAt: number;
  dataEnc: string; // uri y opciones cifradas
  isDefault?: boolean;
};

const DATA_DIR = process.env.DATA_DIR || '/data';
const FILE = path.join(DATA_DIR, 'connections.json');

const ConnectionPayload = z.object({
  name: z.string().min(1),
  uri: z.string().url().or(z.string().startsWith('mongodb://')).or(z.string().startsWith('mongodb+srv://')),
  options: z
    .object({
      tls: z.boolean().optional(),
      ssh: z
        .object({ host: z.string(), port: z.number().default(22), user: z.string(), password: z.string().optional(), privateKey: z.string().optional() })
        .optional(),
    })
    .optional(),
});

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FILE);
  } catch {
    await fs.writeFile(FILE, '[]', 'utf8');
  }
}

export async function connectionsRoutes(app: FastifyInstance) {
  await ensureFile();

  app.addHook('preHandler', async (request, reply) => {
    try {
      // @ts-ignore
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  app.post('/connections/test', async (req, reply) => {
    const body = ConnectionPayload.parse(req.body);
    try {
      const client = new MongoClient(body.uri, { serverSelectionTimeoutMS: 6000 });
      await client.connect();
      await client.db().command({ ping: 1 });
      await client.close();
      return { ok: true };
    } catch (e: any) {
      reply.code(400).send({ ok: false, error: e?.message || 'Fallo de conexión' });
    }
  });

  app.post('/connections', async (req) => {
    const body = ConnectionPayload.parse(req.body);
    const payload = JSON.stringify({ uri: body.uri, options: body.options ?? {} });
    const dataEnc = encryptString(payload);
    const item: StoredConnection = {
      id: randomUUID(),
      name: body.name,
      createdAt: Date.now(),
      dataEnc,
    };
    const list = JSON.parse(await fs.readFile(FILE, 'utf8')) as StoredConnection[];
    list.push(item);
    await fs.writeFile(FILE, JSON.stringify(list, null, 2), 'utf8');
    return { id: item.id, name: item.name, createdAt: item.createdAt };
  });

  app.get('/connections', async () => {
    const list = JSON.parse(await fs.readFile(FILE, 'utf8')) as StoredConnection[];
    return list.map((c) => ({ id: c.id, name: c.name, createdAt: c.createdAt, isDefault: c.isDefault ?? false }));
  });

  app.delete('/connections/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const list = JSON.parse(await fs.readFile(FILE, 'utf8')) as StoredConnection[];
    const next = list.filter((c) => c.id !== id);
    await fs.writeFile(FILE, JSON.stringify(next, null, 2), 'utf8');
    reply.code(204).send();
  });

  app.post('/connect/:id/open', async (req) => {
    const { id } = req.params as { id: string };
    const list = JSON.parse(await fs.readFile(FILE, 'utf8')) as StoredConnection[];
    const item = list.find((c) => c.id === id);
    if (!item) throw new Error('Perfil no encontrado');
    const json = JSON.parse(decryptString(item.dataEnc));
    return { sessionId: await (await import('../routes/session.js')).openByUri(json.uri, json.options) };
  });
}


