import path from "node:path";

import { cors } from "@elysiajs/cors";
import openapi, { fromTypes } from "@elysiajs/openapi";
import { env } from "@mystack/env/server";
import { Elysia } from "elysia";

import { version as packageVersion } from "../package.json";

import { openTelemetry } from "./otel";
import { healthRouter } from "./routers";
import { generateTestToken } from "./util/generate-test-token";

const projectRoot = path.join(import.meta.dirname, "../../..");
const tmpRoot = path.join(projectRoot, "/tmp/openapi");

// in prod use the pre-generated declaration file produced by `bun run build` in packages/api instead.
const fromTypesTarget =
  env.ENV === "production" ? "/app/packages/api/dist/app.d.ts" : "packages/api/src/app.ts";

export const app = new Elysia()
  .use(openTelemetry)
  .use(
    openapi({
      path: "/openapi",
      documentation: {
        info: {
          title: "API Reference",
          version: packageVersion,
        },
        servers: [
          { url: env.CORS_ORIGIN },
          ...(env.DIRECTOR_URL ? [{ url: env.DIRECTOR_URL }] : []),
        ],
        security: [{ bearerAuth: [] }],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
            },
          },
        },
      },
      scalar: {
        persistAuth: true,
        authentication: {
          securitySchemes: {
            bearerAuth: {
              token: env.ENV === "development" ? generateTestToken() : undefined,
            },
          },
        },
      },
      references: fromTypes(fromTypesTarget, {
        projectRoot: projectRoot,
        tmpRoot: tmpRoot,
        overrideOutputPath: env.ENV === "production" ? undefined : "src/app.d.ts",
      }),
    })
  )
  .use(
    cors({
      origin: true,
      methods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  )
  // Public routes (no auth required)
  .use(healthRouter);

export type App = typeof app;
