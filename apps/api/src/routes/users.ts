import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { connectionManager } from '../services/ConnectionManager.js';

export async function usersRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request, reply) => {
    try {
      // @ts-ignore
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  app.get('/:sessionId/users', async (req) => {
    const { sessionId } = req.params as { sessionId: string };
    const { db } = req.query as { db: string };
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const res = await client.db(db).command({ usersInfo: 1, showCredentials: false, showPrivileges: true });
    return res.users;
  });

  app.post('/:sessionId/users', async (req) => {
    const { sessionId } = req.params as { sessionId: string };
    const body = z.object({ db: z.string(), username: z.string(), password: z.string(), roles: z.array(z.any()).default([]) }).parse(req.body);
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const res = await client.db(body.db).command({ createUser: body.username, pwd: body.password, roles: body.roles });
    return res;
  });

  app.patch('/:sessionId/users/:username', async (req) => {
    const { sessionId, username } = req.params as { sessionId: string; username: string };
    const body = z.object({ db: z.string(), password: z.string().optional(), roles: z.array(z.any()).optional() }).parse(req.body);
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const cmd: any = { updateUser: username };
    if (body.password) cmd.pwd = body.password;
    if (body.roles) cmd.roles = body.roles;
    const res = await client.db(body.db).command(cmd);
    return res;
  });

  app.delete('/:sessionId/users/:username', async (req, reply) => {
    const { sessionId, username } = req.params as { sessionId: string; username: string };
    const { db } = req.query as { db: string };
    const client = connectionManager.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    await client.db(db).command({ dropUser: username });
    reply.code(204).send();
  });
}


