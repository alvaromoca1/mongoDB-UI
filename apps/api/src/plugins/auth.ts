import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { env } from '../lib/config.js';

export async function authPlugin(app: FastifyInstance) {
  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

  app.post('/api/auth/login', async (req, reply) => {
    const body = LoginSchema.parse(req.body);
    if (body.email === env.ADMIN_EMAIL && body.password === env.ADMIN_PASSWORD) {
      const token = await app.jwt.sign({ sub: 'admin', role: 'admin' }, { expiresIn: '12h' });
      return { token };
    }
    reply.code(401).send({ error: 'Credenciales inválidas' });
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any;
  }
}


