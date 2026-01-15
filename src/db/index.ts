import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { env } from "../config/env";
import * as schema from "./schema";

const dbPath = env.DB_PATH || "omnii.db";
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Run migrations on startup
// Path is relative to the working directory when the app runs
migrate(db, { migrationsFolder: "./src/db/migrations" });

export * from "./schema";
