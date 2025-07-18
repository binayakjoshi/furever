import { NextResponse, NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    const cookieHeader = request.headers.get("cookie") || "";

    const body = await request.json();

    const backendRes = await fetch(`${process.env.BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    const nextRes = NextResponse.json(data, { status: backendRes.status });

    return nextRes;
  } catch (err) {
    console.error("nlp chat error:", err);
    return NextResponse.json(
      { success: false, message: "Proxy error" },
      { status: 500 }
    );
  }
};
