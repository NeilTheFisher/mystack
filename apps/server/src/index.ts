import { cors } from "@elysiajs/cors";
import { env } from "@mystack/env/server";
import { Elysia } from "elysia";

new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "OPTIONS"],
    })
  )
  .get("/", () => "OK")
  .listen(3000, () => {
    // oxlint-disable-next-line no-console
    console.log("Server is running on http://localhost:3000");
  });
