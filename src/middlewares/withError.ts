import { NextResponse } from "next/server";
import type { Middleware } from "../types";

export const withError: Middleware = async (req, params, user, next) => {
  try {
    return await next(req, params, user);
  } catch (error) {
    console.error("Error:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: (error as Error).message ?? "Internal server error"
      },
      { status: 500 }
    );
  }
};
