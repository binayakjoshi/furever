import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    const cookieHeader = request.headers.get("cookie") || "";

    const backendRes = await fetch(`${process.env.BACKEND_URL}/api/forum`, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error(" Forum proxy error:", err);
    return NextResponse.json(
      { success: false, message: "Proxy error" },
      { status: 500 }
    );
  }
};
