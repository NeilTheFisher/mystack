import { env } from "@mystack/env/server";
import { initLogger, log } from "evlog";

initLogger({
  env: {
    service: "mystack-api",
    environment: env.ENV,
  },
  pretty: env.ENV !== "production",
});

export { log };
