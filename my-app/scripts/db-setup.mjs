import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const rootDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "DATABASE_URL is missing. Add it to .env.local, then run npm run db:setup.",
  );
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

try {
  const schemaSql = await readFile(join(rootDirectory, "db", "schema.sql"), "utf8");
  const seedSql = await readFile(join(rootDirectory, "db", "seed.sql"), "utf8");

  console.log("Applying database schema…");
  await pool.query(schemaSql);

  console.log("Seeding doctors and services…");
  await pool.query(seedSql);

  const { rows } = await pool.query(
    `select
       (select count(*)::int from doctors) as doctors,
       (select count(*)::int from services) as services`,
  );

  console.log(
    `Database ready: ${rows[0].doctors} doctors and ${rows[0].services} services.`,
  );
} catch (error) {
  console.error("Database setup failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
