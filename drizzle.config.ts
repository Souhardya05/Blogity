// drizzle.config.ts

import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({
  path: '.env',
});

export default defineConfig({
  dialect: 'postgresql', // This is the updated property
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Drizzle now prefers 'url'
  },
  verbose: true,
  strict: true,
});