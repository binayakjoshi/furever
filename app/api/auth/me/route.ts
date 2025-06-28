import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const backendRes = await fetch(`${process.env.BACKEND_URL}/api/users/me`, {
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    });
    const data = await backendRes.json();
    const nextRes = NextResponse.json(data, { status: backendRes.status });
    return nextRes;
  } catch (err) {
    console.error("Me proxy error:", err);
    return NextResponse.json(
      { success: false, message: "Proxy error" },
      { status: 500 }
    );
  }
};
