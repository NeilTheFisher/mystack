// oxlint-disable no-console
import type { TestProject } from "vitest/node";

import { initializeSchema } from "./packages/db/src/schema";
import { createEphemeralTestDatabase } from "./packages/db/src/test-database";

export default async function setup(_project: TestProject) {
  Object.assign(process.env, {
    CORS_ORIGIN: "http://localhost:3000",
    DATABASE_URL: "mysql://root:@127.0.0.1:3306/test",
    DIRECTOR_TEST_DATABASE_READY: "false",
    ENV: "test",
    NODE_ENV: "test",
    OTEL_TRACE_EXPORTER_URL: "http://127.0.0.1:4318/v1/traces",
  });

  try {
    const { databaseUrl, host, password, server } = await createEphemeralTestDatabase();

    Object.assign(process.env, {
      DATABASE_URL: databaseUrl,
      DIRECTOR_TEST_DATABASE_READY: "true",
      MYSQL_DATABASE: server.dbName,
      MYSQL_PASSWORD: password,
      MYSQL_SOCKET_ADDRESS: `${host}:${server.port}`,
      MYSQL_USER: server.username,
    });

    await initializeSchema(databaseUrl);

    return async () => {
      await server.stop();
      console.log("test db closed");
    };
  } catch (error) {
    console.warn("[DB INIT] Skipping ephemeral DB setup:", error);

    return async () => {};
  }
}
