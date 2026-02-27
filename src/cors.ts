import type { Context, Middleware } from "@raptor/framework";

import type { Config } from "./config.ts";
import { HttpMethod } from "@raptor/router";

export default class Cors {
  /**
   * Configuration which can be used to change functionality.
   */
  private config: Config;

  /**
   * Initialise the middleware.
   *
   * @param config An optional configuration object.
   *
   * @constructor
   */
  constructor(config?: Config) {
    this.config = {
      ...this.initialiseDefaultConfig(),
      ...config,
    };
  }

  /**
   * Wrapper to pre-bind this to the router handler method.
   */
  public get handle(): Middleware {
    return (context: Context, next: CallableFunction) => {
      return this.handleCors(context, next);
    };
  }

  /**
   * Handle Cross-Origin Resource Sharing (CORS).
   *
   * @param context The current context object of the request.
   * @param next The next middleware in the chain.
   *
   * @returns A valid CORS response object.
   */
  public handleCors(context: Context, next: CallableFunction): unknown {
    const requestOrigin = context.request.headers.get("Origin");

    // Determine the allowed origin
    const allowedOrigin = this.getAllowedOrigin(requestOrigin);

    if (allowedOrigin) {
      context.response.headers.set(
        "Access-Control-Allow-Origin",
        allowedOrigin,
      );

      // If credentials are enabled and origin is not wildcard, set credentials header
      if (this.config.credentials && allowedOrigin !== "*") {
        context.response.headers.set(
          "Access-Control-Allow-Credentials",
          "true",
        );
      }
    }

    // Set allowed methods
    if (this.config.methods && this.config.methods.length > 0) {
      context.response.headers.set(
        "Access-Control-Allow-Methods",
        this.config.methods.join(", "),
      );
    }

    // Set allowed headers
    if (this.config.headers && this.config.headers.length > 0) {
      context.response.headers.set(
        "Access-Control-Allow-Headers",
        this.config.headers.join(", "),
      );
    }

    // Set max age for preflight cache
    if (this.config.maxAge) {
      context.response.headers.set(
        "Access-Control-Max-Age",
        this.config.maxAge,
      );
    }

    // Set exposed headers
    if (this.config.exposeHeaders && this.config.exposeHeaders.length > 0) {
      context.response.headers.set(
        "Access-Control-Expose-Headers",
        this.config.exposeHeaders.join(", "),
      );
    }

    // Handle preflight OPTIONS request
    if (context.request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: context.response.headers,
      });
    }

    // Continue to next middleware for actual requests
    return next();
  }

  /**
   * Determine the allowed origin based on the configuration and request origin.
   *
   * @param requestOrigin The origin from the request headers.
   * @returns The allowed origin or null if not allowed.
   */
  private getAllowedOrigin(requestOrigin: string | null): string | null {
    const { origin } = this.config;

    // No origin configured, default to wildcard
    if (!origin) {
      return "*";
    }

    // String: single origin or wildcard
    if (typeof origin === "string") {
      return origin;
    }

    // Array: multiple origins
    if (Array.isArray(origin)) {
      if (!requestOrigin) {
        return null;
      }
      return origin.includes(requestOrigin) ? requestOrigin : null;
    }

    // Function: dynamic validation
    if (typeof origin === "function") {
      if (!requestOrigin) {
        return null;
      }
      return origin(requestOrigin) ? requestOrigin : null;
    }

    return null;
  }

  /**
   * Initialises the default cors options.
   *
   * @returns The default cors options.
   */
  private initialiseDefaultConfig(): Config {
    return {
      origin: "*",
      methods: [
        HttpMethod.GET,
        HttpMethod.POST,
        HttpMethod.PUT,
        HttpMethod.PATCH,
        HttpMethod.DELETE,
        HttpMethod.OPTIONS,
        HttpMethod.TRACE,
      ],
      headers: ["Content-Type", "Authorization"],
      maxAge: "86400", // 24 hours
      credentials: false,
      exposeHeaders: [],
    };
  }
}
