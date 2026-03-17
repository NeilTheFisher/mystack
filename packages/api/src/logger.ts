import path from "node:path";

import { env } from "@mystack/env/server";
import { initLogger, log } from "evlog";

export const logDir = path.resolve(import.meta.dirname, "../../../storage/logs");

initLogger({
  env: {
    service: "director-api",
    environment: env.ENV,
  },
  pretty: env.ENV !== "production",
});

export { log };
