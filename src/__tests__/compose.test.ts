import { describe, it, expect, jest } from "@jest/globals";
import { NextRequest, NextResponse } from "next/server";
import { composeHandlers } from "../compose";
import type { Middleware } from "../types";

describe("composeHandlers", () => {
  it("should call handler without middlewares", async () => {
    const handler = jest.fn<any>(async () => NextResponse.json({ data: "test" }));
    const composed = composeHandlers(handler);

    const req = new NextRequest("http://localhost:3000/test");
    const params = { id: "123" };
    const user = { id: "user1", role: "admin" };

    await composed(req, params, user);

    expect(handler).toHaveBeenCalled();
  });

  it("should execute middlewares in correct order", async () => {
    const order: string[] = [];

    const handler = jest.fn<any>(async () => {
      order.push("handler");
      return NextResponse.json({ data: "test" });
    });

    const middleware1: Middleware = async (req, params, user, next) => {
      order.push("middleware1-before");
      const response = await next(req, params, user);
      order.push("middleware1-after");
      return response;
    };

    const middleware2: Middleware = async (req, params, user, next) => {
      order.push("middleware2-before");
      const response = await next(req, params, user);
      order.push("middleware2-after");
      return response;
    };

    const composed = composeHandlers(handler, middleware1, middleware2);

    const req = new NextRequest("http://localhost:3000/test");
    await composed(req, {}, undefined);

    expect(order).toEqual([
      "middleware1-before",
      "middleware2-before",
      "handler",
      "middleware2-after",
      "middleware1-after",
    ]);
  });

  it("should allow middleware to modify request params", async () => {
    const handler = jest.fn<any>(async (req: any, params: any) =>
      NextResponse.json({ params })
    );

    const middleware: Middleware = async (req, params: any, user, next) => {
      return next(req, { ...params, modified: true }, user);
    };

    const composed = composeHandlers(handler, middleware);

    const req = new NextRequest("http://localhost:3000/test");
    await composed(req, { id: "123" }, undefined);

    expect(handler).toHaveBeenCalled();
  });

  it("should allow middleware to modify user", async () => {
    const handler = jest.fn<any>(async (req: any, params: any, user: any) =>
      NextResponse.json({ user })
    );

    const middleware: Middleware = async (req, params, user, next) => {
      return next(req, params, { id: "user1", role: "admin" });
    };

    const composed = composeHandlers(handler, middleware);

    const req = new NextRequest("http://localhost:3000/test");
    await composed(req, {}, undefined);

    expect(handler).toHaveBeenCalled();
  });

  it("should allow middleware to short-circuit the chain", async () => {
    const handler = jest.fn<any>(async () => NextResponse.json({ data: "handler" }));

    const middleware: Middleware = async () => {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };

    const composed = composeHandlers(handler, middleware);

    const req = new NextRequest("http://localhost:3000/test");
    const response = await composed(req, {}, undefined);

    expect(handler).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("should allow middleware to modify response", async () => {
    const handler = jest.fn<any>(async () =>
      NextResponse.json({ data: "original" })
    );

    const middleware: Middleware = async (req, params, user, next) => {
      const response = await next(req, params, user);
      const data = await response.json();
      return NextResponse.json({ ...data, modified: true });
    };

    const composed = composeHandlers(handler, middleware);

    const req = new NextRequest("http://localhost:3000/test");
    const response = await composed(req, {}, undefined);

    const data = await response.json();
    expect(data).toEqual({ data: "original", modified: true });
  });

  it("should handle multiple middlewares modifying response", async () => {
    const handler = jest.fn<any>(async () => NextResponse.json({ count: 0 }));

    const incrementMiddleware: Middleware = async (req, params, user, next) => {
      const response = await next(req, params, user);
      const data = await response.json();
      return NextResponse.json({ ...data, count: data.count + 1 });
    };

    const composed = composeHandlers(
      handler,
      incrementMiddleware,
      incrementMiddleware,
      incrementMiddleware
    );

    const req = new NextRequest("http://localhost:3000/test");
    const response = await composed(req, {}, undefined);

    const data = await response.json();
    expect(data).toEqual({ count: 3 });
  });

  it("should handle errors thrown in middlewares", async () => {
    const handler = jest.fn<any>(async () => NextResponse.json({ data: "test" }));

    const errorMiddleware: Middleware = async () => {
      throw new Error("Middleware error");
    };

    const composed = composeHandlers(handler, errorMiddleware);

    const req = new NextRequest("http://localhost:3000/test");

    await expect(composed(req, {}, undefined)).rejects.toThrow(
      "Middleware error"
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it("should pass params and user through all middlewares", async () => {
    const calls: any[] = [];

    const handler = jest.fn<any>(async (req: any, params: any, user: any) => {
      calls.push({ handler: { params, user } });
      return NextResponse.json({ data: "test" });
    });

    const middleware1: Middleware = async (req, params, user, next) => {
      calls.push({ middleware1: { params, user } });
      return next(req, params, user);
    };

    const middleware2: Middleware = async (req, params, user, next) => {
      calls.push({ middleware2: { params, user } });
      return next(req, params, user);
    };

    const composed = composeHandlers(handler, middleware1, middleware2);

    const req = new NextRequest("http://localhost:3000/test");
    const params = { id: "123" };
    const user = { id: "user1", role: "admin" };

    await composed(req, params, user);

    expect(calls).toEqual([
      { middleware1: { params, user } },
      { middleware2: { params, user } },
      { handler: { params, user } },
    ]);
  });
});
