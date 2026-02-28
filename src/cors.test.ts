// Copyright 2026, Raptor. All rights reserved. MIT license.

import { assertEquals } from "@std/assert";
import { type Context, HttpMethod } from "@raptor/kernel";

import Cors from "./cors.ts";

function createMockContext(
  method: string = "GET",
  origin?: string,
): Context {
  const headers = new Headers();

  if (origin) {
    headers.set("Origin", origin);
  }

  return {
    request: {
      method,
      headers,
    } as Request,
    response: {
      headers: new Headers(),
    } as Response,
  } as Context;
}

const mockNext = () => ({ called: true });

Deno.test("test cors sets default wildcard origin", () => {
  const cors = new Cors();
  const context = createMockContext("GET", "https://example.com");

  cors.handleCors(context, mockNext);

  assertEquals(
    context.response.headers.get("Access-Control-Allow-Origin"),
    "*",
  );
});

Deno.test("test cors sets default methods", () => {
  const cors = new Cors();
  const context = createMockContext("GET");

  cors.handleCors(context, mockNext);

  const methods = context.response.headers.get("Access-Control-Allow-Methods");

  assertEquals(methods?.includes("GET"), true);
  assertEquals(methods?.includes("POST"), true);
  assertEquals(methods?.includes("PUT"), true);
  assertEquals(methods?.includes("DELETE"), true);
});

Deno.test("test cors sets default headers", () => {
  const cors = new Cors();
  const context = createMockContext("GET");

  cors.handleCors(context, mockNext);

  const headers = context.response.headers.get("Access-Control-Allow-Headers");

  assertEquals(headers, "Content-Type, Authorization");
});

Deno.test("test cors sets default max age", () => {
  const cors = new Cors();
  const context = createMockContext("GET");

  cors.handleCors(context, mockNext);

  assertEquals(
    context.response.headers.get("Access-Control-Max-Age"),
    "86400",
  );
});

Deno.test("test cors calls next for non-OPTIONS requests", () => {
  const cors = new Cors();
  const context = createMockContext("GET");

  const result = cors.handleCors(context, mockNext);

  assertEquals(result, { called: true });
});

Deno.test("test cors allows exact origin match", () => {
  const cors = new Cors({ origin: "https://example.com" });
  const context = createMockContext("GET", "https://example.com");

  cors.handleCors(context, mockNext);

  assertEquals(
    context.response.headers.get("Access-Control-Allow-Origin"),
    "https://example.com",
  );
});

Deno.test("test cors uses configured origin regardless of request origin", () => {
  const cors = new Cors({ origin: "https://example.com" });
  const context = createMockContext("GET", "https://different.com");

  cors.handleCors(context, mockNext);

  assertEquals(
    context.response.headers.get("Access-Control-Allow-Origin"),
    "https://example.com",
  );
});

Deno.test("test cors allows first origin in array", () => {
  const cors = new Cors({
    origin: ["https://example.com", "https://app.example.com"],
  });

  const context = createMockContext("GET", "https://example.com");

  cors.handleCors(context, mockNext);

  assertEquals(
    context.response.headers.get("Access-Control-Allow-Origin"),
    "https://example.com",
  );
});

Deno.test("test cors allows second origin in array", () => {
  const cors = new Cors({
    origin: ["https://example.com", "https://app.example.com"],
  });

  const context = createMockContext("GET", "https://app.example.com");

  cors.handleCors(context, mockNext);

  assertEquals(
    context.response.headers.get("Access-Control-Allow-Origin"),
    "https://app.example.com",
  );
});

Deno.test("test cors does not allow origin not in array", () => {
  const cors = new Cors({
    origin: ["https://example.com", "https://app.example.com"],
  });

  const context = createMockContext("GET", "https://different.com");

  cors.handleCors(context, mockNext);

  assertEquals(
    context.response.headers.get("Access-Control-Allow-Origin"),
    null,
  );
});

Deno.test("test cors does not set origin when request has no origin", () => {
  const cors = new Cors({
    origin: ["https://example.com"],
  });

  const context = createMockContext("GET");

  cors.handleCors(context, mockNext);

  assertEquals(
    context.response.headers.get("Access-Control-Allow-Origin"),
    null,
  );
});

Deno.test("test cors allows origin when function returns true", () => {
  const cors = new Cors({
    origin: (origin) => origin.endsWith(".example.com"),
  });

  const context = createMockContext("GET", "https://app.example.com");

  cors.handleCors(context, mockNext);

  assertEquals(
    context.response.headers.get("Access-Control-Allow-Origin"),
    "https://app.example.com",
  );
});

Deno.test("test cors does not allow origin when function returns false", () => {
  const cors = new Cors({
    origin: (origin) => origin.endsWith(".example.com"),
  });

  const context = createMockContext("GET", "https://different.com");

  cors.handleCors(context, mockNext);

  assertEquals(
    context.response.headers.get("Access-Control-Allow-Origin"),
    null,
  );
});

Deno.test("test cors function validation does not set origin when request has no origin", () => {
  const cors = new Cors({
    origin: (origin) => origin.endsWith(".example.com"),
  });

  const context = createMockContext("GET");

  cors.handleCors(context, mockNext);

  assertEquals(
    context.response.headers.get("Access-Control-Allow-Origin"),
    null,
  );
});

Deno.test("test cors sets credentials header when enabled", () => {
  const cors = new Cors({
    origin: "https://example.com",
    credentials: true,
  });

  const context = createMockContext("GET", "https://example.com");

  cors.handleCors(context, mockNext);

  assertEquals(
    context.response.headers.get("Access-Control-Allow-Credentials"),
    "true",
  );
});

Deno.test("test cors does not set credentials header when disabled", () => {
  const cors = new Cors({
    origin: "https://example.com",
    credentials: false,
  });

  const context = createMockContext("GET", "https://example.com");

  cors.handleCors(context, mockNext);

  assertEquals(
    context.response.headers.get("Access-Control-Allow-Credentials"),
    null,
  );
});

Deno.test("test cors does not set credentials header with wildcard origin", () => {
  const cors = new Cors({
    origin: "*",
    credentials: true,
  });

  const context = createMockContext("GET", "https://example.com");

  cors.handleCors(context, mockNext);

  assertEquals(
    context.response.headers.get("Access-Control-Allow-Credentials"),
    null,
  );
});

Deno.test("test cors sets custom methods", () => {
  const cors = new Cors({
    methods: [HttpMethod.GET, HttpMethod.POST],
  });

  const context = createMockContext("GET");

  cors.handleCors(context, mockNext);

  assertEquals(
    context.response.headers.get("Access-Control-Allow-Methods"),
    "GET, POST",
  );
});

Deno.test("test cors sets custom headers", () => {
  const cors = new Cors({
    headers: ["Content-Type", "X-Custom-Header"],
  });

  const context = createMockContext("GET");

  cors.handleCors(context, mockNext);

  assertEquals(
    context.response.headers.get("Access-Control-Allow-Headers"),
    "Content-Type, X-Custom-Header",
  );
});

Deno.test("test cors sets expose headers", () => {
  const cors = new Cors({
    exposeHeaders: ["X-Total-Count", "X-Page-Number"],
  });

  const context = createMockContext("GET");

  cors.handleCors(context, mockNext);

  assertEquals(
    context.response.headers.get("Access-Control-Expose-Headers"),
    "X-Total-Count, X-Page-Number",
  );
});

Deno.test("test cors does not set header when expose headers is empty", () => {
  const cors = new Cors({
    exposeHeaders: [],
  });

  const context = createMockContext("GET");

  cors.handleCors(context, mockNext);

  assertEquals(
    context.response.headers.get("Access-Control-Expose-Headers"),
    null,
  );
});

Deno.test("test cors sets custom max age", () => {
  const cors = new Cors({
    maxAge: "7200",
  });

  const context = createMockContext("GET");

  cors.handleCors(context, mockNext);

  assertEquals(
    context.response.headers.get("Access-Control-Max-Age"),
    "7200",
  );
});

Deno.test("test cors returns 204 response for OPTIONS request", () => {
  const cors = new Cors();
  const context = createMockContext("OPTIONS");

  const response = cors.handleCors(context, mockNext);

  assertEquals(response instanceof Response, true);
  assertEquals((response as Response).status, 204);
});

Deno.test("test cors includes headers in OPTIONS response", () => {
  const cors = new Cors({
    origin: "https://example.com",
  });

  const context = createMockContext("OPTIONS", "https://example.com");

  const response = cors.handleCors(context, mockNext) as Response;

  assertEquals(
    response.headers.get("Access-Control-Allow-Origin"),
    "https://example.com",
  );
});

Deno.test("test cors does not call next for OPTIONS request", () => {
  const cors = new Cors();
  const context = createMockContext("OPTIONS");

  let nextCalled = false;

  const next = () => {
    nextCalled = true;
    return {};
  };

  cors.handleCors(context, next);

  assertEquals(nextCalled, false);
});

Deno.test("test cors handle getter returns bound middleware", () => {
  const cors = new Cors();
  const middleware = cors.handle;
  const context = createMockContext("GET");

  const result = middleware(context, mockNext);

  assertEquals(result, { called: true });
  assertEquals(
    context.response.headers.get("Access-Control-Allow-Origin"),
    "*",
  );
});
