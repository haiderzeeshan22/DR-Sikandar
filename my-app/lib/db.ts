import "server-only";
import { Pool, types, type QueryResultRow } from "pg";

// Return DATE columns as YYYY-MM-DD strings instead of timezone-shifted Dates.
types.setTypeParser(1082, (value: string) => value);

const globalForDatabase = globalThis as typeof globalThis & {
  clinicDatabasePool?: Pool;
};

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not configured. Add it to .env.local before starting the app.",
    );
  }

  return new Pool({
    connectionString,
    max: 10,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
  });
}

export function getDatabasePool() {
  if (!globalForDatabase.clinicDatabasePool) {
    globalForDatabase.clinicDatabasePool = createPool();
  }

  return globalForDatabase.clinicDatabasePool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
) {
  return getDatabasePool().query<T>(text, values);
}
