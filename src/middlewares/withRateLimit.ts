import { NextResponse } from "next/server";
import type { Middleware } from "../types";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS = 60000;

export const withRateLimit: Middleware = async (req, params, user, next) => {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();

  const record = rateLimitMap.get(ip);

  if (record && now < record.resetTime) {
    if (record.count >= RATE_LIMIT) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    record.count++;
  } else {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
  }

  return next(req, params, user);
};
