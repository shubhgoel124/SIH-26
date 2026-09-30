import { NextRequest, NextResponse } from "next/server"
import { auth } from "./auth"

const PUBLIC_PATHS = ["/", "/sign-in", "/sign-up"]

function isPublic(pathname: string) {
  if (!pathname) return true
  if (pathname.startsWith("/_next/") || pathname.startsWith("/favicon")) return true
  if (pathname.startsWith("/verify/")) return true
  if (pathname.startsWith("/api/announcements")) return true
  if (pathname.startsWith("/api/verify/")) return true
  return PUBLIC_PATHS.some((p) => pathname === p)
}

export const middleware = async (req: NextRequest) => {
  const { pathname } = req.nextUrl
  const session = await auth()

  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  if (!session && pathname !== "/sign-in" && pathname !== "/sign-up") {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl.origin))
  }

  if (session && (pathname === "/sign-in" || pathname === "/sign-up")) {
    const role = session.user.role
    const dest =
      role === "admin"
        ? "/admin"
        : role === "trainer"
          ? "/trainer"
          : "/trainee"
    return NextResponse.redirect(new URL(dest, req.nextUrl.origin))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.webp$).*)",
  ],
  runtime: "nodejs",
}
