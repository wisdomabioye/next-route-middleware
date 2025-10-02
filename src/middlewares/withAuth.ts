import { NextResponse } from "next/server";
import type { Middleware } from "../types";

export const withAuth: Middleware<any, { id: string; role: string }> = async (
  req,
  params,
  user,
  next
) => {
  const token = req.headers.get("authorization");

  if (!token || token !== "valid-token") {
    return NextResponse.json({ error: "Unauthorized" });
  }

  const authedUser = { id: "123", role: "admin" };
  return next(req, params, authedUser);
};
