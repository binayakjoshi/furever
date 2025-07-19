import { NextRequest, NextResponse } from "next/server";

type ParamType = {
  params: Promise<{ vetId: string }>;
};
export const GET = async (request: NextRequest, { params }: ParamType) => {
  try {
    const { vetId } = await params;
    const cookieHeader = request.headers.get("cookie") || "";
    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/vets/${vetId}`,
      { headers: { Cookie: cookieHeader } }
    );
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

export const DELETE = async (request: NextRequest, { params }: ParamType) => {
  try {
    const { vetId } = await params;
    const cookieHeader = request.headers.get("cookie") || "";

    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/users/${vetId}`,
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
