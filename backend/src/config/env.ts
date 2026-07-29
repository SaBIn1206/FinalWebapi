import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url().default('mongodb://localhost:27017/bakeryhub'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  if (process.env.NODE_ENV === 'test') {
    return {
      NODE_ENV: 'test',
      PORT: 5000,
      DATABASE_URL: 'mongodb://localhost:27017/bakeryhub_test',
      JWT_SECRET: 'test-jwt-secret-key-for-testing-only',
      ALLOWED_ORIGINS: 'http://localhost:3000',
    } as Env;
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment configuration:', parsed.error.format());
    throw new Error('Environment validation failed');
  }
  return parsed.data;
}
