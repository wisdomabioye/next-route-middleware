import { RouteHandler, Middleware } from "./types";

export function composeHandlers<P = any, U = any>(
  handler: RouteHandler<P, U>,
  ...middlewares: Middleware<P, U>[]
): RouteHandler<P, U> {
  return middlewares.reduceRight<RouteHandler<P, U>>(
    (next, mw) => (req, params, user) => mw(req, params, user, next),
    handler
  );
}
