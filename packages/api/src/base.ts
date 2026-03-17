import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";

import "./logger";

export const base = new Elysia({ name: "base" }).use(evlog());
