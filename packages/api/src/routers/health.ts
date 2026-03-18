import { Elysia, sse } from "elysia";

import { base } from "../base";

export const healthRouter = new Elysia({ prefix: "/health", detail: { tags: ["Health"] } })
  .use(base)
  .get("/", () => "OK")
  .get(
    "/redis-test",
    async () => {
      const { redis } = await import("@mystack/db");
      await redis.set("health-check", "ok");
      const value = await redis.get("health-check");
      return value === "ok" ? "Redis OK" : "Redis Error";
    },
    {
      afterHandle: async () => {
        const { redis } = await import("@mystack/db");
        await redis.del("health-check");
      },
    }
  )
  .get("/live", async function* () {
    let i = 0;
    while (true) {
      yield sse(`${i}`);
      i += 1;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  });
