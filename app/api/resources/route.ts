import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Resource from "@/models/resource"
import { hasRole } from "@/lib/auth"

// Get all resources
export const GET = hasRole(["admin", "doctor"])(async (req: NextRequest) => {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const department = searchParams.get("department")
    const type = searchParams.get("type")
    const status = searchParams.get("status")

    const query: any = {}

    if (department) query.department = department
    if (type) query.type = type
    if (status) query.status = status

    const resources = await Resource.find(query)

    return NextResponse.json({ success: true, resources }, { status: 200 })
  } catch (error) {
    console.error("Get resources error:", error)
    return NextResponse.json({ success: false, message: "Server error fetching resources" }, { status: 500 })
  }
})

// Create a new resource
export const POST = hasRole(["admin"])(async (req: NextRequest) => {
  try {
    await dbConnect()

    const body = await req.json()
    const { name, type, department, capacity } = body

    // Validate required fields
    if (!name || !type || !department) {
      return NextResponse.json({ success: false, message: "Name, type, and department are required" }, { status: 400 })
    }

    // Create new resource
    const resource = new Resource({
      name,
      type,
      department,
      status: "available",
      capacity: capacity || null,
      currentUsage: 0,
    })

    await resource.save()

    return NextResponse.json({ success: true, resource }, { status: 201 })
  } catch (error) {
    console.error("Create resource error:", error)
    return NextResponse.json({ success: false, message: "Server error creating resource" }, { status: 500 })
  }
})

