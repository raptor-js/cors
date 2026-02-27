import type { Middleware } from "@raptor/framework";

import Cors from "./cors.ts";
import type { Config } from "./config.ts";

export default function cors(config?: Config): Middleware {
  const instance = new Cors(config);

  return instance.handle;
}
