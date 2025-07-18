import { NextRequest, NextResponse } from "next/server";
export const GET = async (request: NextRequest) => {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const backendRes = await fetch(`${process.env.BACKEND_URL}/api/vets/`, {
      headers: { Cookie: cookieHeader },
    });
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "could not get the vet details" },
      { status: 500 }
    );
  }
};
