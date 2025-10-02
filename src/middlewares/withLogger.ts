import type { Middleware } from "../types";

export const withLogger: Middleware = async (req, params, user, next) => {
  console.log(`[${req.method}] ${req.nextUrl.href}`, { params, user });
  const response = await next(req, params, user);
  console.log(`Response: ${response.status}`);
  return response;
};
