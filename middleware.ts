import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

export function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get("token")?.value

  // Get the pathname
  const { pathname } = request.nextUrl

  // Define protected routes by role
  const adminRoutes = ["/admin"]
  const doctorRoutes = ["/doctor"]
  const patientRoutes = ["/patient"]
  const authRoutes = ["/auth/login", "/auth/register"]

  // Check if the route is protected
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  const isDoctorRoute = doctorRoutes.some((route) => pathname.startsWith(route))
  const isPatientRoute = patientRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname === route)

  // Allow access to the landing page at root path
  if (pathname === "/") {
    return NextResponse.next()
  }

  // If no token and trying to access protected route, redirect to login
  if (!token && (isAdminRoute || isDoctorRoute || isPatientRoute)) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // If token exists, verify it
  if (token) {
    const decoded = verifyToken(token) as { role?: string } | null

    // If token is invalid and trying to access protected route, redirect to login
    if (!decoded && (isAdminRoute || isDoctorRoute || isPatientRoute)) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // Check role-based access
    if (decoded) {
      // If user is logged in and trying to access auth routes, redirect to dashboard
      if (isAuthRoute) {
        if (decoded.role === "admin") {
          return NextResponse.redirect(new URL("/admin", request.url))
        } else if (decoded.role === "doctor") {
          return NextResponse.redirect(new URL("/doctor", request.url))
        } else {
          return NextResponse.redirect(new URL("/patient", request.url))
        }
      }

      // If admin route but not admin
      if (isAdminRoute && decoded.role !== "admin") {
        if (decoded.role === "doctor") {
          return NextResponse.redirect(new URL("/doctor", request.url))
        } else {
          return NextResponse.redirect(new URL("/patient", request.url))
        }
      }

      // If doctor route but not doctor or admin
      if (isDoctorRoute && decoded.role !== "doctor" && decoded.role !== "admin") {
        return NextResponse.redirect(new URL("/patient", request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/admin/:path*", "/doctor/:path*", "/patient/:path*", "/auth/login", "/auth/register"],
}

