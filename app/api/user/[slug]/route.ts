import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    const { slug } = await params;
    const cookieHeader = request.headers.get("cookie") || "";

    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/users/${slug}`,
      {
        method: "DELETE",
        headers: { Cookie: cookieHeader },
      }
    );
    const data = await backendRes.json();
    const nextRes = NextResponse.json(data, { status: backendRes.status });

    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);

    return nextRes;
  } catch (err) {
    console.error("user delete proxy error:", err);
    return NextResponse.json(
      { success: false, message: "Proxy error" },
      { status: 500 }
    );
  }
};
