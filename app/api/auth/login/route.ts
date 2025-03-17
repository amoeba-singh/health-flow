import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/user"
import { generateToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken(user)

    // Set cookie with token
    const cookieStore = await cookies();
    cookieStore.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })

    // Return user data (excluding password) and token
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialty: user.specialty,
      department: user.department,
      phoneNumber: user.phoneNumber,
    }

    return NextResponse.json({ success: true, user: userData, token }, { status: 200 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Server error during login" }, { status: 500 })
  }
}

