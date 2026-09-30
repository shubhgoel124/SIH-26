import { NextRequest, NextResponse } from "next/server"
import { auth } from "./auth"

const PUBLIC_PATHS = ["/", "/sign-in", "/sign-up"]

function isPublic(pathname: string) {
  if (!pathname) return true
  if (pathname.startsWith("/_next/") || pathname.startsWith("/favicon")) return true
  if (pathname.startsWith("/verify/")) return true
  if (pathname.startsWith("/uploads/")) return true
  return PUBLIC_PATHS.some((p) => pathname === p)
}

function homeForRole(role: string) {
  if (role === "admin") return "/admin"
  if (role === "trainer") return "/trainer"
  return "/trainee"
}

export const middleware = async (req: NextRequest) => {
  const { pathname } = req.nextUrl
  const session = await auth()

  if (isPublic(pathname)) {
    if (session && (pathname === "/sign-in" || pathname === "/sign-up")) {
      return NextResponse.redirect(new URL(homeForRole(session.user.role), req.nextUrl.origin))
    }
    return NextResponse.next()
  }

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl.origin))
  }

  const role = session.user.role
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(homeForRole(role), req.nextUrl.origin))
  }
  if (pathname.startsWith("/trainer") && role !== "trainer") {
    return NextResponse.redirect(new URL(homeForRole(role), req.nextUrl.origin))
  }
  if (pathname.startsWith("/trainee") && role !== "trainee") {
    return NextResponse.redirect(new URL(homeForRole(role), req.nextUrl.origin))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.webp$|.*\\.pdf$|.*\\.txt$).*)",
  ],
  runtime: "nodejs",
}
