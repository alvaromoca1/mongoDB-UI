import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
// @ts-ignore - fastify-sse doesn't have types
import sse from 'fastify-sse';
import { AppModule } from './modules/app.module';
import multipart from '@fastify/multipart';
import { env } from './lib/config';

async function bootstrap() {
  const adapter = new FastifyAdapter({ logger: true });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter);
  await app.register(multipart as any);
  await app.register(cors as any, {
    origin: '*',
    credentials: false,
  });
  await app.register(helmet as any);
  await app.register(jwt as any, { secret: env.JWT_SECRET });
  await app.register(sse as any);
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 4000, '0.0.0.0');
}

bootstrap();


