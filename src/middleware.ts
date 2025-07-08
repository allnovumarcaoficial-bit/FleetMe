import authMiddleware from "next-auth/middleware";

export default authMiddleware;

export const config = {
  matcher: [
    "/((?!api|auth/signin|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|css|js|map)).*)",
  ],
};
