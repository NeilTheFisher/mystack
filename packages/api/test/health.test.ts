import { treaty } from "@elysiajs/eden";
import { app } from "@mystack/api";
import { describe, expect, it } from "vitest";

const eden = treaty(app);

describe("Health endpoint", () => {
  it("returns OK from GET /health", async () => {
    const { data, error } = await eden.health.get();

    expect(error).toBeNull();
    expect(data).toBe("OK");
  });

  it("returns OK from GET /health/redis-test", async () => {
    const { data, error } = await eden.health["redis-test"].get();

    expect(error).toBeNull();
    expect(data).toBe("Redis OK");
  });
});
