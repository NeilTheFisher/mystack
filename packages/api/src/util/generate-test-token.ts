import fs from "node:fs";
import path from "node:path";

import jwt from "jsonwebtoken";

import { log } from "../logger";

export function generateTestToken(userId = "1", verify = false) {
  const keyDir = path.join(import.meta.dirname, "../../../../priv");
  const privateKeyPath = path.join(keyDir, "private-key.pem");

  const hasRsaKey = fs.existsSync(privateKeyPath);
  if (!hasRsaKey) {
    log.warn({ message: "generateTestToken: falling back to symmetric key (dev only)" });
  }

  const signingKey = hasRsaKey ? fs.readFileSync(privateKeyPath) : "dev-secret";
  const algorithm = hasRsaKey ? "RS256" : "HS256";

  const token = jwt.sign({ sub: userId }, signingKey, {
    algorithm,
    expiresIn: "10years",
  });

  if (verify) {
    try {
      const decoded = jwt.verify(token, signingKey, {
        algorithms: [algorithm],
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
