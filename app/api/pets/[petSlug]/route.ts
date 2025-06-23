//this router is for pet detail page
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ petSlug: string }> }
) {
  try {
    const { petSlug } = await params;
    const cookieHeader = request.headers.get("cookie") || "";

    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/pets/${petSlug}`,
      {
        headers: { Cookie: cookieHeader },
      }
    );
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("Pet detail proxy error:", err);
    return NextResponse.json(
      { success: false, message: "Proxy error" },
      { status: 500 }
    );
  }
}
