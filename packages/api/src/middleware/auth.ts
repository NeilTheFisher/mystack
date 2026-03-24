import { Elysia } from "elysia";

import { resolveSession } from "../context";

export const clientIpMiddleware = new Elysia({ name: "clientIp" }).derive(
  { as: "scoped" },
  ({ request }) => {
    const clientIp = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for");
    return { clientIp: clientIp ?? undefined };
  }
);

export const authMiddleware = new Elysia({ name: "auth" }).derive(
  { as: "scoped" },
  async ({ request }) => {
    const clientIp = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for");
    const session = await resolveSession(request);
    return { session, clientIp: clientIp ?? undefined };
  }
);
