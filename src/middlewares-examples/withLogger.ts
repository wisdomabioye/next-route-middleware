import type { Middleware } from "../types";

export const withLogger: Middleware = async (req, params, user, next) => {
  console.log(`[withLogger] ${req.method} ${req.nextUrl.href}`);
  const response = await next(req, params, user);
  console.log(`[withLogger] Response status: ${response.status}`);
  return response;
};
