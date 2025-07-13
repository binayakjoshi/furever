// middleware.ts at project root
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC = ["/login", "/signup", "/about", "/contacts"];

export const middleware = (req: NextRequest) => {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const path = pathname.replace(/\/$/, "");

  if (token && (path === "/login" || path === "/signup")) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (PUBLIC.includes(path)) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
