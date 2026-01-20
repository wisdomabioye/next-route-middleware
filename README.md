📦 next-route-middleware

A lightweight, Express/Koa-style middleware system for Next.js route handlers.
Easily compose middlewares (auth, error handling, logging, rate limiting, etc.) in your app/ routes.

✨ Features

✅ Express/Koa-like next() middleware flow

✅ Type-safe with generic UserType

✅ Works with Next.js App Router (app/ directory)

✅ Example middlewares available in [`src/middlewares-examples/`](./src/middlewares-examples/) for reference:

- withError — catch errors and return JSON
- withAuth — authenticate requests
- withRateLimit — simple rate limiting
- withCors — add CORS headers
- withCache — add cache headers
- withLogger — log requests & responses

> **Note:** These example middlewares are **not included in the published package**. They are provided as reference implementations to help you get started. Copy and customize them in your own project as needed.

📦 Installation

```bash
npm install next-route-middleware
# or
yarn add next-route-middleware
# or
pnpm add next-route-middleware
```

### Usage
Example Route (`app/api/hello/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { composeHandlers } from "next-route-middleware";
// Import your own middlewares (see "Creating Custom Middlewares" below)
import { withError, withAuth, withRateLimit, withLogger } from "@/middlewares";

async function baseHandler(
  req: NextRequest,
  params: { id: string },
  user?: { id: string; role: string }
) {
  return NextResponse.json({ message: `Hello ${user?.id}`, params });
}

// Compose middlewares around handler
export const GET = composeHandlers(
  baseHandler,
  withError,
  withLogger,
  withRateLimit,
  withAuth
);
```

➡️ Order matters:
1. withAuth runs last before handler
2. withRateLimit checks before auth
3. withLogger logs every request
4. withError wraps everything


#### Middleware Signature
```typescript
export type Middleware<P = any, U = any> = (
  req: NextRequest,
  params: P,
  user: U | undefined,
  next: RouteHandler<P, U>
) => Promise<Response> | Response;
```

- `req` → Next.js NextRequest
- `params` → Route params (from [id] etc.)
- `user` → Optional user object (your type)
- `next` → Calls the next handler in the chain

### ⚡ Creating Custom Middlewares
Want to build your own? Just follow the middleware signature. Here are some examples:

#### Example 1: Adding Custom Headers
```typescript
import type { Middleware } from "next-route-middleware";

export const withCustomHeader: Middleware = async (req, params, user, next) => {
  const response = await next(req, params, user);

  const headers = new Headers(response.headers);
  headers.set("X-Custom-Header", "My-Value");
  headers.set("X-Request-ID", crypto.randomUUID());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
```

#### Example 2: Request Validation
```typescript
import { NextResponse } from "next/server";
import type { Middleware } from "next-route-middleware";

export const withValidation: Middleware = async (req, params, user, next) => {
  const contentType = req.headers.get("content-type");

  if (req.method === "POST" && !contentType?.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type must be application/json" },
      { status: 400 }
    );
  }

  return next(req, params, user);
};
```

#### Example 3: Response Transformation
```typescript
import { NextResponse } from "next/server";
import type { Middleware } from "next-route-middleware";

export const withTimestamp: Middleware = async (req, params, user, next) => {
  const response = await next(req, params, user);

  // Add timestamp to JSON responses
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    const data = await response.json();
    return NextResponse.json({
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  return response;
};
```

#### Using Your Custom Middleware
```typescript
export const GET = composeHandlers(
  baseHandler,
  withError,
  withCustomHeader,
  withValidation,
  withTimestamp
);
```

#### 📖 Example Project

To test quickly, clone the repo and run the included Next.js example:

```bash
git clone https://github.com/wisdomabioye/next-route-middleware
cd next-route-middleware/example
npm install
npm run dev
```

___

### 📝 Roadmap

- More example middlewares (withSession, withMetrics, etc.)
- Better TypeScript inference for user
- Integration tests with Next.js app/ routes

### 🤝 Contributing
PRs welcome! Please open an issue for discussion before submitting new example middlewares or features.

### 📜 License
MIT © 2025 — Built with ❤️ for the Next.js community