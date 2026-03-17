import { env } from "@mystack/env/server";
import { drizzle } from "drizzle-orm/mysql2";
import Redis from "ioredis";

import * as schema from "./schema";

export const db = drizzle({
  connection: {
    uri: env.DATABASE_URL,
  },
  schema,
  mode: "default",
});

export const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : new Redis();

export * from "./schema";
