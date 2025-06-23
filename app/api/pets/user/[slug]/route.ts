import { NextRequest, NextResponse } from "next/server";

type YourPetProps = {
  params: Promise<{ slug?: string }>;
};
export const GET = async (request: NextRequest, { params }: YourPetProps) => {
  try {
    const { slug } = await params;
    const cookieHeader = request.headers.get("cookie") || "";

    const backendRes = await fetch(
      `http://localhost:5000/api/pets/user/${slug}`,
      {
        headers: {
          Cookie: cookieHeader,
        },
      }
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("Pets by user proxy error:", err);
    return NextResponse.json(
      { success: false, message: "Proxy error" },
      { status: 500 }
    );
  }
};
