import { NextRequest, NextResponse } from "next/server";
import {
  composeHandlers,
  withError,
  withLogger,
  withRateLimit,
} from "next-route-middleware";

async function baseHandler(
  req: NextRequest,
  params: { id?: string }
) {
  const id = req.nextUrl.searchParams.get("id") ?? "unknown";
  return NextResponse.json({ message: `Hello from /api/hello`, id });
}

export const GET = composeHandlers(
  baseHandler,
  withError,
  withLogger,
  withRateLimit
);
