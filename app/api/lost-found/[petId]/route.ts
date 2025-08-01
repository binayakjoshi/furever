import { NextRequest, NextResponse } from "next/server";

type ParamType = {
  params: Promise<{ petId: string }>;
};

export const POST = async (request: NextRequest, { params }: ParamType) => {
  try {
    const { petId } = await params;

    const cookieHeader = request.headers.get("cookie") || "";
    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/lost-pets/${petId}/found`,
      {
        method: "POST",
        headers: {
          Cookie: cookieHeader,
          "Content-Type": "application/json",
        },
        body: null,
      }
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.log(err);
    throw new Error("could not get the adoption list");
  }
};
