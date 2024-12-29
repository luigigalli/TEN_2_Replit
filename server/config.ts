import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file in development
dotenv.config();

// Environment detection
export const isReplit = Boolean(process.env.REPL_ID && process.env.REPL_OWNER);
export const isDevelopment = process.env.NODE_ENV !== 'production';

// Port configuration - Always use 5000 in Replit
const PORT = 5000;

// Environment configuration schema
const configSchema = z.object({
  database: z.object({
    url: z.string().min(1),
  }),
  server: z.object({
    port: z.number().int().positive(),
    host: z.string(),
    corsOrigins: z.array(z.union([z.string(), z.instanceof(RegExp)])),
  }),
  env: z.enum(['development', 'production']).default('development'),
});

// Configuration object
export const config = {
  database: {
    url: process.env.DATABASE_URL || '',
  },
  server: {
    port: PORT,
    host: '0.0.0.0',  // Bind to all network interfaces
    corsOrigins: [
      // Allow local development
      `http://localhost:${PORT}`,
      `http://127.0.0.1:${PORT}`,
      `http://0.0.0.0:${PORT}`,
      // Allow Replit domains
      /\.repl\.co$/,
    ],
  },
  env: (process.env.NODE_ENV || 'development') as 'development' | 'production',
};

// Validate configuration
try {
  configSchema.parse(config);
} catch (error) {
  console.error('Invalid configuration:', error);
  process.exit(1);
}