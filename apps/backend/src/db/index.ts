import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

const sqlite = new Database("omnii.db");
export const db = drizzle(sqlite, { schema });

// Run migrations on startup
// Path is relative to the working directory when the app runs
migrate(db, { migrationsFolder: "./src/db/migrations" });

export * from "./schema";

