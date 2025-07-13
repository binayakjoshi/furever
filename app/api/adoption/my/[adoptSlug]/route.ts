import { NextRequest, NextResponse } from "next/server";
export const DELETE = async (
  request: NextRequest,
  { params }: { params: { adoptSlug: string } }
) => {
  try {
    const { adoptSlug } = await params;
    const cookieHeader = request.headers.get("cookie") || "";

    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/adoptions/${adoptSlug}`,
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
export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ adoptSlug: string }> }
) => {
  try {
    const { adoptSlug } = await params;
    const body = await request.json();
    const cookieHeader = request.headers.get("cookie") || "";
    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/adoptions/${adoptSlug}`,
      {
        method: "PUT",
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
    console.error("edit adoption proxy error:", err);
    return NextResponse.json(
      { success: false, message: "Proxy error" },
      { status: 500 }
    );
  }
};
