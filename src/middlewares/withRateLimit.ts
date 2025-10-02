import { NextResponse } from "next/server";
import type { Middleware } from "../types";

export const withRateLimit: Middleware = async (req, params, user, next) => {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  if (ip === "bad-ip") {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  return next(req, params, user);
};
