import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { env } from "../config/env";
import * as schema from "./schema";

const client = postgres(env.DATABASE_URL);
export const db = drizzle(client, { schema });

// Run migrations on startup
// Path is relative to the working directory when the app runs
const migrationClient = postgres(env.DATABASE_URL, { max: 1 });
const migrationDb = drizzle(migrationClient);
await migrate(migrationDb, { migrationsFolder: "./src/db/migrations" });
await migrationClient.end();

export * from "./schema";
