import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute =
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/api/qr") ||
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.startsWith("/auth");
  const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard");

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isProtectedRoute) {
    if (isLoggedIn) return NextResponse.next();
    return NextResponse.redirect(new URL("/auth/signin", nextUrl));
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
