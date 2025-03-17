import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import type { IUser } from "@/models/user"

const JWT_SECRET = process.env.JWT_SECRET!

if (!JWT_SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable")
}

export function generateToken(user: Partial<IUser>) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function getTokenFromRequest(req: NextRequest) {
  // Check authorization header first
  const authHeader = req.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  // Then check cookies
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  return token
}

export async function getUserFromToken(token: string) {
  try {
    const decoded = verifyToken(token) as { id: string } | null
    if (!decoded) return null

    // Import dynamically to avoid circular dependencies
    const User = (await import("@/models/user")).default
    const user = await User.findById(decoded.id).select("-password")
    return user
  } catch (error) {
    return null
  }
}

export function isAuthenticated(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const token = getTokenFromRequest(req)

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 })
    }

    return handler(req, user)
  }
}

export function hasRole(roles: string[]) {
  return (handler: (req: NextRequest, user: any) => Promise<NextResponse>) => {
    return isAuthenticated(async (req, user) => {
      if (!roles.includes(user.role)) {
        return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 403 })
      }

      return handler(req, user)
    })
  }
}

