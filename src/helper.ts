import type { Middleware } from "@raptor/kernel";

import Cors from "./cors.ts";
import type { Config } from "./config.ts";

/**
 * Helper function for intantiating CORS package.
 *
 * @param config An optional configuration object.
 *
 * @returns Calls the CORS middleware handler function.
 */
export default function cors(config?: Config): Middleware {
  const instance = new Cors(config);

  return instance.handle;
}
