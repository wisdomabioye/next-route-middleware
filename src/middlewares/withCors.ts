import { NextResponse } from "next/server";
import type { Middleware } from "../types";

export const withCors: Middleware = async (req, params, user, next) => {
  const response = await next(req, params, user);

  const newHeaders = new Headers(response.headers);
  newHeaders.set("Access-Control-Allow-Origin", "*");
  newHeaders.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  newHeaders.set("Access-Control-Allow-Headers", "Content-Type,Authorization");

  return new NextResponse(response.body, { ...response, headers: newHeaders });
};
