import { NextRequest, NextResponse } from "next/server";

type ParamsType = {
  params: Promise<{ postId: string }>;
};

export const GET = async (request: NextRequest, { params }: ParamsType) => {
  try {
    const { postId } = await params;
    const cookieHeader = request.headers.get("cookie") || "";

    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/forum/${postId}`,
      {
        headers: {
          Cookie: cookieHeader,
        },
      }
    );

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

export const POST = async (request: NextRequest, { params }: ParamsType) => {
  try {
    const { postId } = await params;

    const cookieHeader = request.headers.get("cookie") || "";

    const body = await request.json();

    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/forum/${postId}/replies`,
      {
        method: "POST",
        headers: {
          Cookie: cookieHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendRes.json();
    const nextRes = NextResponse.json(data, { status: backendRes.status });

    return nextRes;
  } catch (err) {
    console.error("create forum post proxy error:", err);
    return NextResponse.json(
      { success: false, message: "Proxy error" },
      { status: 500 }
    );
  }
};
