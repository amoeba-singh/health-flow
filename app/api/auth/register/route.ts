import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/user"
import { generateToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()
    const { name, email, password, role, specialty, department, phoneNumber } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: "Name, email, and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ success: false, message: "User with this email already exists" }, { status: 400 })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || "patient",
      specialty,
      department,
      phoneNumber,
    })

    await user.save()

    // Generate JWT token
    const token = generateToken(user)

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

    return NextResponse.json({ success: true, user: userData, token }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "Server error during registration" }, { status: 500 })
  }
}

