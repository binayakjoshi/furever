//this file to get user's adoption post
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/adoptions/my-posts`,
      {
        headers: {
          Cookie: cookieHeader,
        },
      }
    );
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.log(err);
    throw new Error("could not get the adoption list");
  }
};
