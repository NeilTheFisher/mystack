import { db } from "@mystack/db";
import * as schema from "@mystack/db/migrations/schema";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

describe("Ephemeral DB API smoke tests", () => {
  it("inserts and reads a cache row through Drizzle ORM", async () => {
    const key = `memory-db-smoke-${Date.now()}`;
    const value = "works";
    const expiration = Math.floor(Date.now() / 1000) + 60;

    await db.insert(schema.cache).values({
      key,
      value,
      expiration,
    });

    const [cacheRow] = await db
      .select()
      .from(schema.cache)
      .where(eq(schema.cache.key, key))
      .limit(1);

    expect(cacheRow).toBeDefined();
    expect(cacheRow.key).toBe(key);
    expect(cacheRow.value).toBe(value);
    expect(cacheRow.expiration).toBe(expiration);
  });
});
