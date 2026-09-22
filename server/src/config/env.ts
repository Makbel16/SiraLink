import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().default('postgresql://siralink:siralink_secret@localhost:5432/siralink_db'),
  JWT_SECRET: z.string().min(16).default('super_secret_jwt_key_siralink_ethiopia_2026_dev'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('*'),
  UPLOAD_PROVIDER: z.enum(['local', 's3']).default('local'),
  UPLOAD_DIR: z.string().default('./uploads'),
  UPLOAD_BUCKET: z.string().optional(),
  UPLOAD_REGION: z.string().optional(),
  UPLOAD_ENDPOINT: z.string().optional(),
  UPLOAD_ACCESS_KEY: z.string().optional(),
  UPLOAD_SECRET_KEY: z.string().optional(),
  PUBLIC_STORAGE_BASE_URL: z.string().default('http://localhost:3000/uploads'),
  OPENAI_API_KEY: z.string().optional(),
  EXPO_ACCESS_TOKEN: z.string().optional(),
  SMS_PROVIDER: z.enum(['mock', 'twilio', 'infobip']).default('mock')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
