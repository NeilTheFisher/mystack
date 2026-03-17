// oxlint-disable no-console
import { createDB as createMemoryDb } from "mysql-memory-server";

const testDatabaseHost = "127.0.0.1";

type EphemeralTestDatabase = Awaited<ReturnType<typeof createMemoryDb>>;
type EphemeralTestDatabaseState = {
  databaseUrl: string;
  host: string;
  password: string;
  server: EphemeralTestDatabase;
};

let createEphemeralTestDatabasePromise: Promise<EphemeralTestDatabaseState> | undefined;

function getEphemeralDatabaseUrl(server: EphemeralTestDatabase) {
  return `mysql://${server.username}:@${testDatabaseHost}:${server.port}/${server.dbName}`;
}

async function createEphemeralTestDatabase() {
  if (createEphemeralTestDatabasePromise) {
    return createEphemeralTestDatabasePromise;
  }

  createEphemeralTestDatabasePromise = (async () => {
    const start = Date.now();
    const dbName = "test_db";

    console.log("[DB INIT] Creating in-memory MySQL server...");
    const server = await createMemoryDb({
      dbName,
      ignoreUnsupportedSystemVersion: true,
      logLevel: "ERROR",
      xEnabled: "OFF",
    });
    console.log(`[DB INIT] Memory database created on ${testDatabaseHost}:${server.port}`);

    const totalMs = Date.now() - start;
    console.log(`[DB INIT] Memory db fully initialized in ${totalMs}ms`);

    return {
      databaseUrl: getEphemeralDatabaseUrl(server),
      host: testDatabaseHost,
      password: "",
      server,
    };
  })();

  try {
    return await createEphemeralTestDatabasePromise;
  } catch (error) {
    console.error("[DB INIT] Error during database initialization:", error);
    createEphemeralTestDatabasePromise = undefined;
    throw error;
  }
}

export { createEphemeralTestDatabase };
