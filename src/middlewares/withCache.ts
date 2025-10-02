import { NextResponse } from "next/server";
import type { Middleware } from "../types";

export const withCache: Middleware = async (req, params, user, next) => {
  const response = await next(req, params, user);

  return new NextResponse(response.body, {
    ...response,
    headers: {
      ...Object.entries(response.headers),
      "Cache-Control": "public, max-age=60",
    },
  });
};
