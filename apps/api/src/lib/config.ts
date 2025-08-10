import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  JWT_SECRET: z.string().min(16),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5111'),
  ENCRYPTION_KEY: z.string().min(32),
  SSH_ENABLED: z.string().optional(),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(6),
});

export const env = EnvSchema.parse(process.env);


