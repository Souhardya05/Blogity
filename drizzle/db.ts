// drizzle/db.ts

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create the client connection
const client = postgres(process.env.DATABASE_URL!);

// Create the Drizzle instance
export const db = drizzle(client, { schema });