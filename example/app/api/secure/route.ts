import { NextRequest, NextResponse } from "next/server";
import {
  composeHandlers,
  withError,
  withAuth,
  withCors,
} from "next-route-middleware";


export const GET = composeHandlers(
  secureHandler,
  withError,
  withCors,
  withAuth
);

async function secureHandler(
  req: NextRequest,
  params: {},
  user?: { id: string; role: string }
) {
  return NextResponse.json({
    message: `Welcome to secure endpoint`,
    user,
  });
}

