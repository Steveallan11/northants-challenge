import { Pool, type PoolClient, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __northantsPool: Pool | undefined;
}

function getConnectionString() {
  return process.env.DATABASE_URL;
}

export function hasDatabase() {
  return Boolean(getConnectionString());
}

export function getPool() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL");
  }

  if (!global.__northantsPool) {
    global.__northantsPool = new Pool({
      connectionString,
      ssl: false,
      connectionTimeoutMillis: 3000,
      query_timeout: 5000,
      statement_timeout: 5000,
      idleTimeoutMillis: 10000,
      max: 5,
    });
  }

  return global.__northantsPool;
}

export async function dbQuery<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  return getPool().query<T>(text, params);
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const result = await callback(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
