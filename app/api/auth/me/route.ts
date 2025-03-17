import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { getUserFromToken, getTokenFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const token = getTokenFromRequest(req)

    if (!token) {
      return NextResponse.json({ success: false, message: "No authentication token found" }, { status: 401 })
    }

    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 })
    }

    // Return user data (excluding password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialty: user.specialty,
      department: user.department,
      phoneNumber: user.phoneNumber,
    }

    return NextResponse.json({ success: true, user: userData }, { status: 200 })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ success: false, message: "Server error fetching user data" }, { status: 500 })
  }
}

