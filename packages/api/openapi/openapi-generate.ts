// oxlint-disable no-console
import { $ } from "bun";

import { app } from "../src/app";

// Fetch the OpenAPI spec from the running app
const response = await app.handle(new Request("http://localhost/openapi/json"));
const spec = (await response.json()) as {
  paths: Record<string, Record<string, unknown>>;
  servers: { url: string }[];
};

// Post-process spec to fix OAS 3.0 compatibility issues from Elysia's output
fixSpec(spec);

const customServer = process.env.OPENAPI_SERVER_URL;
if (customServer) {
  spec.servers = [{ url: customServer }];
} else {
  spec.servers = [];
}

const output = "./openapi/openapi.json";
await $`echo '${JSON.stringify(spec, null, 2)}' > ${output} && bun x oxfmt ${output}`;
console.log(`OpenAPI spec generated at ${output}`);

if (process.env.OPENAPI_GENERATE_CLIENT === "true") {
  await $`openapi-generator-cli generate`;
}

// ── Spec fixups ──────────────────────────────────────────────────────────────

function fixSpec(spec: { paths: Record<string, Record<string, unknown>> | undefined }) {
  if (!spec.paths) return;

  for (const [pathStr, pathItem] of Object.entries(spec.paths)) {
    const paramNames = [...pathStr.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);

    for (const operation of Object.values(pathItem)) {
      if (typeof operation !== "object" || operation === null) continue;
      const op = operation as Record<string, unknown>;

      // Ensure every operation has a responses object
      if (!op.responses) {
        op.responses = { "200": { description: "Successful response" } };
      }

      // Detect SSE endpoints: Elysia emits { "$ref": "AsyncGenerator" } for generator routes
      if (hasBareRef(op.responses, "AsyncGenerator")) {
        op["x-is-sse"] = true;
      }

      // Ensure path template variables have matching parameter definitions
      if (paramNames.length > 0) {
        const params = (op.parameters ?? []) as Array<Record<string, unknown>>;
        for (const name of paramNames) {
          if (!params.some((p) => p.name === name && p.in === "path")) {
            params.push({ name, in: "path", required: true, schema: { type: "string" } });
          }
        }
        op.parameters = params;
      }
    }
  }

  // Recursively fix schema-level issues
  fixSchemas(spec);
}

/** Returns true if any nested schema contains a bare (non-local) $ref with the given name. */
function hasBareRef(obj: unknown, name: string): boolean {
  if (typeof obj !== "object" || obj === null) return false;
  if (Array.isArray(obj)) return obj.some((v) => hasBareRef(v, name));
  const rec = obj as Record<string, unknown>;
  if (rec.$ref === name) return true;
  return Object.values(rec).some((v) => hasBareRef(v, name));
}

function fixSchemas(obj: unknown): void {
  if (typeof obj !== "object" || obj === null) return;

  if (Array.isArray(obj)) {
    for (const item of obj) fixSchemas(item);
    return;
  }

  const rec = obj as Record<string, unknown>;

  // Recurse first so children are fixed before parent logic runs
  for (const value of Object.values(rec)) fixSchemas(value);

  // "const": X  →  "enum": [X]   (const is JSON Schema ≥ draft-6, not OAS 3.0)
  if ("const" in rec) {
    rec.enum = [rec.const];
    delete rec.const;
  }

  // "patternProperties"  →  "additionalProperties"  (not OAS 3.0)
  if (
    "patternProperties" in rec &&
    typeof rec.patternProperties === "object" &&
    rec.patternProperties !== null
  ) {
    const first = Object.values(rec.patternProperties as Record<string, unknown>)[0];
    rec.additionalProperties = first ?? {};
    delete rec.patternProperties;
  }

  // Bare $ref like "AsyncGenerator" → replace with generic object
  if ("$ref" in rec && typeof rec.$ref === "string" && !rec.$ref.startsWith("#")) {
    delete rec.$ref;
    rec.type = "object";
  }

  // Remove { "type": "undefined" } entries from anyOf, then unwrap single-item anyOf
  if (Array.isArray(rec.anyOf)) {
    rec.anyOf = (rec.anyOf as Array<Record<string, unknown>>).filter((s) => s.type !== "undefined");
    if ((rec.anyOf as unknown[]).length === 1) {
      const single = (rec.anyOf as unknown[])[0] as Record<string, unknown>;
      delete rec.anyOf;
      Object.assign(rec, single);
    } else if ((rec.anyOf as unknown[]).length === 0) {
      delete rec.anyOf;
    }
  }
}
