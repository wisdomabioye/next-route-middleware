import { NextRequest, NextResponse } from "next/server";

export type RouteHandler<P = any, U = any> = (
  req: NextRequest,
  params: P,
  user?: U
) => Promise<NextResponse> | NextResponse;

export type Middleware<P = any, U = any> = (
  req: NextRequest,
  params: P,
  user: U | undefined,
  next: RouteHandler<P, U>
) => Promise<NextResponse> | NextResponse;
