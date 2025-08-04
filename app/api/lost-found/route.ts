import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    const cookieHeader = request.headers.get("cookie") || "";

    const formData = await request.formData();

    const backendRes = await fetch(`${process.env.BACKEND_URL}/api/lost-pets`, {
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
    console.error("create lost and found post proxy error:", err);
    return NextResponse.json(
      { success: false, message: "Proxy error" },
      { status: 500 }
    );
  }
};
export const GET = async (request: NextRequest) => {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const backendRes = await fetch(`${process.env.BACKEND_URL}/api/lost-pets`, {
      headers: {
        Cookie: cookieHeader,
      },
    });
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.log(err);
    throw new Error("could not get the pet  list");
  }
};
