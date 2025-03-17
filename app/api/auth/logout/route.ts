import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  // Create the response and clear the token cookie
  const response = NextResponse.json({ success: true, message: "Logged out successfully" }, { status: 200 })

  response.cookies.set("token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })

  return response
}