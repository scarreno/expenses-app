import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/app/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const isLoggedIn = !!request.auth;
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(
      new URL("/login", request.nextUrl.origin)
    );
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(
      new URL("/", request.nextUrl.origin)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|api/receipts/upload-file|_next/static|_next/image|favicon.ico).*)",
  ],
};