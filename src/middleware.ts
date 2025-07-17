import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export default withAuth(
  function middleware(req) {
    if (
      req.nextUrl.pathname.startsWith("/gestionarusuarios") &&
      req.nextauth.token?.role !== Role.ADMIN
    ) {
      return NextResponse.rewrite(new URL("/auth/signin", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    "/gestionarusuarios/:path*",
    "/((?!api|auth/signin|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|css|js|map)).*)",
  ],
};
