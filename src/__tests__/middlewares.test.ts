import { describe, it, expect, jest } from "@jest/globals";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "../middlewares/withAuth";
import { withError } from "../middlewares/withError";
import { withLogger } from "../middlewares/withLogger";
import { withRateLimit } from "../middlewares/withRateLimit";
import { withCors } from "../middlewares/withCors";
import { withCache } from "../middlewares/withCache";

describe("withAuth", () => {
  it("should return 401 when Authorization header is missing", async () => {
    const next = jest.fn<any>();
    const req = new NextRequest("http://localhost:3000/test");

    const response = await withAuth(req, {}, undefined, next);

    expect(response.status).toBe(401);
    expect(next).not.toHaveBeenCalled();
    const data = await response.json();
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("should call next with decoded user when Authorization header is present", async () => {
    const next = jest.fn<any>(async () => NextResponse.json({ success: true }));
    const req = new NextRequest("http://localhost:3000/test", {
      headers: { Authorization: "Bearer token123" },
    });

    await withAuth(req, { id: "123" }, undefined, next);

    expect(next).toHaveBeenCalled();
  });
});

describe("withError", () => {
  it("should catch errors and return 500 response", async () => {
    const next = jest.fn<any>(async () => {
      throw new Error("Test error");
    });
    const req = new NextRequest("http://localhost:3000/test");

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const response = await withError(req, {}, undefined, next);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({
      error: "Internal Server Error",
      message: "Test error",
    });
    expect(consoleSpy).toHaveBeenCalledWith("Error:", expect.any(Error));

    consoleSpy.mockRestore();
  });

  it("should pass through successful responses", async () => {
    const next = jest.fn<any>(async () => NextResponse.json({ data: "success" }));
    const req = new NextRequest("http://localhost:3000/test");

    const response = await withError(req, {}, undefined, next);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ data: "success" });
  });
});

describe("withLogger", () => {
  it("should log request and response details", async () => {
    const next = jest.fn<any>(async () =>
      NextResponse.json({ data: "test" }, { status: 200 })
    );
    const req = new NextRequest("http://localhost:3000/test", {
      method: "GET",
    });

    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const response = await withLogger(req, {}, undefined, next);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "[withLogger] GET http://localhost:3000/test"
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "[withLogger] Response status: 200"
    );
    expect(next).toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });
});

describe("withRateLimit", () => {
  it("should return 429 when rate limit is exceeded", async () => {
    const next = jest.fn<any>(async () => NextResponse.json({ data: "test" }));
    const req = new NextRequest("http://localhost:3000/test", {
      headers: { "x-forwarded-for": "192.168.1.1" },
    });

    // Call it 6 times to exceed the limit of 5
    let response;
    for (let i = 0; i < 6; i++) {
      response = await withRateLimit(req, {}, undefined, next);
    }

    expect(response!.status).toBe(429);
    const data = await response!.json();
    expect(data).toEqual({ error: "Too many requests" });
  });

  it("should allow requests within rate limit", async () => {
    const next = jest.fn<any>(async () => NextResponse.json({ data: "test" }));
    const req = new NextRequest("http://localhost:3000/test", {
      headers: { "x-forwarded-for": "192.168.1.2" },
    });

    const response = await withRateLimit(req, {}, undefined, next);

    expect(response.status).toBe(200);
    expect(next).toHaveBeenCalled();
  });
});

describe("withCors", () => {
  it("should add CORS headers to response", async () => {
    const next = jest.fn<any>(async () => NextResponse.json({ data: "test" }));
    const req = new NextRequest("http://localhost:3000/test");

    const response = await withCors(req, {}, undefined, next);

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    expect(response.headers.get("Access-Control-Allow-Headers")).toBe(
      "Content-Type,Authorization"
    );
  });

  it("should preserve existing response data", async () => {
    const next = jest.fn<any>(async () =>
      NextResponse.json({ data: "test" }, { status: 201 })
    );
    const req = new NextRequest("http://localhost:3000/test");

    const response = await withCors(req, {}, undefined, next);

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toEqual({ data: "test" });
  });
});

describe("withCache", () => {
  it("should add Cache-Control header to response", async () => {
    const next = jest.fn<any>(async () => NextResponse.json({ data: "test" }));
    const req = new NextRequest("http://localhost:3000/test");

    const response = await withCache(req, {}, undefined, next);

    expect(response.headers.get("Cache-Control")).toBe("public, max-age=60");
  });

  it("should preserve existing response data", async () => {
    const next = jest.fn<any>(async () =>
      NextResponse.json({ data: "cached" }, { status: 200 })
    );
    const req = new NextRequest("http://localhost:3000/test");

    const response = await withCache(req, {}, undefined, next);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ data: "cached" });
  });
});
