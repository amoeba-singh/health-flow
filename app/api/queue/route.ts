import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Queue from "@/models/queue"
import { hasRole } from "@/lib/auth"

// Get all queues (admin only)
export const GET = hasRole(["admin", "doctor"])(async (req: NextRequest) => {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const department = searchParams.get("department")

    const query = department ? { department } : {}

    const queues = await Queue.find(query).populate("patientsInQueue.patient", "name email phoneNumber")

    return NextResponse.json({ success: true, queues }, { status: 200 })
  } catch (error) {
    console.error("Get queues error:", error)
    return NextResponse.json({ success: false, message: "Server error fetching queues" }, { status: 500 })
  }
})

// Create or update a queue
export const POST = hasRole(["admin", "doctor"])(async (req: NextRequest) => {
  try {
    await dbConnect()

    const body = await req.json()
    const { department, averageWaitTime } = body

    if (!department) {
      return NextResponse.json({ success: false, message: "Department is required" }, { status: 400 })
    }

    // Find or create queue
    let queue = await Queue.findOne({ department })

    if (!queue) {
      queue = new Queue({
        department,
        averageWaitTime: averageWaitTime || 15,
        patientsInQueue: [],
      })
    } else if (averageWaitTime) {
      queue.averageWaitTime = averageWaitTime
    }

    await queue.save()

    return NextResponse.json({ success: true, queue }, { status: 200 })
  } catch (error) {
    console.error("Create/update queue error:", error)
    return NextResponse.json({ success: false, message: "Server error managing queue" }, { status: 500 })
  }
})

