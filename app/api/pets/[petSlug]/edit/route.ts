import { NextRequest, NextResponse } from "next/server";

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ petSlug: string }> }
) => {
  try {
    const { petSlug } = await params;
    const formData = await request.formData();
    const cookieHeader = request.headers.get("cookie") || "";
    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/pets/${petSlug}`,
      {
        method: "PUT",
        headers: {
          Cookie: cookieHeader,
        },
        body: formData,
      }
    );
    const data = await backendRes.json();
    const nextRes = NextResponse.json(data, { status: backendRes.status });

    return nextRes;
  } catch (err) {
    console.error("Add Pet proxy error:", err);
    return NextResponse.json(
      { success: false, message: "Proxy error" },
      { status: 500 }
    );
  }
};
