import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
// @ts-ignore - fastify-sse doesn't have types
import sse from 'fastify-sse';
import { env } from './lib/config.js';
import { buildLoggerOptions } from './lib/logger.js';
import { authPlugin } from './plugins/auth.js';
import { connectionsRoutes } from './routes/connections.js';
import { sessionRoutes } from './routes/session.js';
import { dbRoutes } from './routes/db.js';
import { crudRoutes } from './routes/crud.js';
import { indexRoutes } from './routes/indexes.js';
import { miscRoutes } from './routes/misc.js';
import { streamRoutes } from './routes/stream.js';
import { analysisRoutes } from './routes/analysis.js';
import { transferRoutes } from './routes/transfer.js';
import { usersRoutes } from './routes/users.js';

async function start() {
  const app = Fastify({
    logger: buildLoggerOptions(env.NODE_ENV),
    disableRequestLogging: false,
  });

  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim());
      const ok = allowed.includes(origin);
      cb(ok ? null : new Error('Not allowed by CORS'), ok);
    },
    credentials: true,
  });

  await app.register(helmet, { global: true });
  await app.register(jwt, { secret: env.JWT_SECRET });
  await app.register(multipart);
  await app.register(sse as any);

  await app.register(authPlugin);
  await app.register(connectionsRoutes, { prefix: '/api' });
  await app.register(sessionRoutes, { prefix: '/api' });
  await app.register(dbRoutes, { prefix: '/api' });
  await app.register(crudRoutes, { prefix: '/api' });
  await app.register(indexRoutes, { prefix: '/api' });
  await app.register(miscRoutes, { prefix: '/api' });
  await app.register(streamRoutes, { prefix: '/api' });
  await app.register(analysisRoutes, { prefix: '/api' });
  await app.register(transferRoutes, { prefix: '/api' });
  await app.register(usersRoutes, { prefix: '/api' });

  app.get('/health', async () => ({ status: 'ok' }));

  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  app.log.info(`API escuchando en http://localhost:${env.PORT}`);
}

start().catch(console.error);


