import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.redirect(`${process.env.BACKEND_URL}/auth/google`);
};
