import { NextResponse, type NextRequest } from "next/server";

const roleRoutes = {
  LEARNER: "/learner",
  REVIEWER: "/reviewer",
  ADMIN: "/admin"
} as const;

const protectedRoutes = {
  "/learner": "LEARNER",
  "/reviewer": "REVIEWER",
  "/admin": "ADMIN"
} as const;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const matchedPath = Object.keys(protectedRoutes).find((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  ) as keyof typeof protectedRoutes | undefined;

  if (!matchedPath) {
    return NextResponse.next();
  }

  const expectedRole = protectedRoutes[matchedPath];
  const accessToken = request.cookies.get("auth_access_token")?.value;
  const refreshToken = request.cookies.get("auth_refresh_token")?.value;
  const role = request.cookies.get("auth_user_role")?.value as keyof typeof roleRoutes | undefined;

  if ((!accessToken && !refreshToken) || !role || !roleRoutes[role]) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (role !== expectedRole) {
    return NextResponse.redirect(new URL(roleRoutes[role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/learner/:path*", "/reviewer/:path*", "/admin/:path*"]
};
