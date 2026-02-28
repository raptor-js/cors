import type { HttpMethod } from "@raptor/kernel";

/**
 * Optional configuration object for CORS package.
 */
export interface Config {
  /**
   * Allowed origin(s) for CORS requests.
   *
   * @default "*"
   */
  origin?: string | string[] | ((origin: string) => boolean);

  /**
   * Allowed HTTP methods for CORS requests.
   *
   * @default [GET, POST, PUT, PATCH, DELETE, OPTIONS, TRACE]
   */
  methods?: HttpMethod[];

  /**
   * Allowed request headers for CORS requests.
   *
   * @default ["Content-Type", "Authorization"]
   */
  headers?: string[];

  /**
   * How long (in seconds) the preflight response can be cached.
   *
   * @default "86400" (24 hours)
   */
  maxAge?: string;

  /**
   * Whether to include credentials (cookies, authorization headers, TLS certificates) in CORS requests.
   *
   * @default false
   */
  credentials?: boolean;

  /**
   * Response headers that should be exposed to the client.
   *
   * @default []
   */
  exposeHeaders?: string[];
}
