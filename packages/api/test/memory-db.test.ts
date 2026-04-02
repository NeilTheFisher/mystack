import { cache, db } from "@mystack/db";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

describe.skipIf(process.env.TEST_DATABASE_READY !== "true")("Ephemeral DB API smoke tests", () => {
  it("inserts and reads a cache row through Drizzle ORM", async () => {
    const key = `memory-db-smoke-${Date.now()}`;
    const value = "works";
    const expiration = Math.floor(Date.now() / 1000) + 60;

    await db.insert(cache).values({
      key,
      value,
      expiration,
    });

    const [cacheRow] = await db.select().from(cache).where(eq(cache.key, key)).limit(1);

    expect(cacheRow).toBeDefined();
    // oxlint-disable
    if (!cacheRow) {
      throw new Error("Expected cache row to exist after insert");
    }
    // oxlint-enable

    expect(cacheRow.key).toBe(key);
    expect(cacheRow.value).toBe(value);
    expect(cacheRow.expiration).toBe(expiration);
  });
});
