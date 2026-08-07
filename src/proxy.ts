import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Route-prefix gate: the cheap first line of defense. Every service method
// re-checks the role itself (see src/services/auth-service.ts's
// requireRole), so a route slipping through here still can't reach data it
// shouldn't — this only saves a redirect/round-trip.
const ADMIN_ONLY = ["/admin"];
const STAFF_ONLY = ["/customers", "/tailors", "/payments"];

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;

  if (ADMIN_ONLY.some((prefix) => pathname.startsWith(prefix)) && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (STAFF_ONLY.some((prefix) => pathname.startsWith(prefix)) && role === "TAILOR") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)"],
};
