// /app/api/auth/google/callback/route.ts
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  const qs = new URL(req.url).search;
  return NextResponse.redirect(
    `${process.env.BACKEND_URL}/auth/google/callback${qs}`
  );
};
