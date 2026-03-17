import { createEnv } from "@t3-oss/env-core";
import "dotenv/config";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    CORS_ORIGIN: z.url().default("http://localhost:3000"),
    ENV: z.enum(["development", "production", "test"]).default("development"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    OTEL_TRACE_EXPORTER_URL: z.url().default("http://127.0.0.1:4318/v1/traces"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
