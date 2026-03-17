import fs from "node:fs";
import path from "node:path";

import jwt from "jsonwebtoken";

import { log } from "../logger";

export function generateTestToken(userId = "1", verify = false) {
  const keyDir = path.join(import.meta.dirname, "../../../../priv");
  const privateKey = fs.readFileSync(path.join(keyDir, "private-key.pem"));
  const publicKey = fs.readFileSync(path.join(keyDir, "public.key"));

  const token = jwt.sign({ sub: userId }, privateKey, {
    algorithm: "RS256",
    expiresIn: "10years",
  });

  if (verify) {
    try {
      const decoded = jwt.verify(token, publicKey, {
        algorithms: ["RS256"],
        clockTolerance: 250,
      });
      log.info("generateTestToken", "✓ Verification successful!");
      log.info({ decoded });
    } catch (error) {
      log.error({ message: "✗ Verification failed", error });
      log.error({ message: "Full error", error });
    }
  }

  return token;
}
