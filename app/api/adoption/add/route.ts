//forward add pet functionality
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    const cookieHeader = request.headers.get("cookie") || "";

    const formData = await request.formData();

    const backendRes = await fetch(`${process.env.BACKEND_URL}/api/adoptions`, {
      method: "POST",
      headers: {
        Cookie: cookieHeader,
      },
      body: formData,
    });

    const data = await backendRes.json();
    const nextRes = NextResponse.json(data, { status: backendRes.status });

    return nextRes;
  } catch (err) {
    console.error("create adoption post proxy error:", err);
    return NextResponse.json(
      { success: false, message: "Proxy error" },
      { status: 500 }
    );
  }
};
