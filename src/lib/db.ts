import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { Connector, IpAddressTypes } from "@google-cloud/cloud-sql-connector";

declare global {
  // eslint-disable-next-line no-var
  var __northantsPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __northantsPoolPromise: Promise<Pool> | undefined;
  // eslint-disable-next-line no-var
  var __northantsConnector: Connector | undefined;
}

function getConnectionString() {
  return process.env.DATABASE_URL;
}

function getConnectorConfig() {
  const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASS;
  const database = process.env.DB_NAME;

  if (!instanceConnectionName || !user || !password || !database) {
    return null;
  }

  return {
    instanceConnectionName,
    user,
    password,
    database,
  };
}

function getGoogleCredentialEnv() {
  const projectId = process.env.GOOGLE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

function ensureGoogleApplicationCredentials() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return;
  }

  const credentials = getGoogleCredentialEnv();
  if (!credentials) {
    return;
  }

  const credentialsPath = path.join(tmpdir(), "northants-cloudsql-service-account.json");
  writeFileSync(
    credentialsPath,
    JSON.stringify({
      type: "service_account",
      project_id: credentials.projectId,
      private_key: credentials.privateKey.replace(/\\n/g, "\n"),
      client_email: credentials.clientEmail,
      token_uri: "https://oauth2.googleapis.com/token",
    }),
    "utf8",
  );

  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
}

export function hasDatabase() {
  return Boolean(getConnectionString() || getConnectorConfig());
}

async function createPool() {
  const connectionString = getConnectionString();
  if (connectionString) {
    return new Pool({
      connectionString,
      ssl: false,
      connectionTimeoutMillis: 3000,
      query_timeout: 5000,
      statement_timeout: 5000,
      idleTimeoutMillis: 10000,
      max: 5,
    });
  }

  const connectorConfig = getConnectorConfig();
  if (!connectorConfig) {
    throw new Error("Missing database configuration");
  }

  ensureGoogleApplicationCredentials();

  if (!global.__northantsConnector) {
    global.__northantsConnector = new Connector();
  }

  const clientOpts = await global.__northantsConnector.getOptions({
    instanceConnectionName: connectorConfig.instanceConnectionName,
    ipType: IpAddressTypes.PUBLIC,
  });

  return new Pool({
    ...clientOpts,
    user: connectorConfig.user,
    password: connectorConfig.password,
    database: connectorConfig.database,
    connectionTimeoutMillis: 3000,
    query_timeout: 5000,
    statement_timeout: 5000,
    idleTimeoutMillis: 10000,
    max: 5,
  });
}

export async function getPool() {
  if (global.__northantsPool) {
    return global.__northantsPool;
  }

  if (!global.__northantsPoolPromise) {
    global.__northantsPoolPromise = createPool().then((pool) => {
      global.__northantsPool = pool;
      return pool;
    });
  }

  return global.__northantsPoolPromise;
}

export async function dbQuery<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  const pool = await getPool();
  return pool.query<T>(text, params);
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
  const pool = await getPool();
  const client = await pool.connect();
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
