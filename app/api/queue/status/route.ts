import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Queue from "@/models/queue"
import { isAuthenticated } from "@/lib/auth"

// Get patient's queue status
export const GET = isAuthenticated(async (req: NextRequest, user) => {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const department = searchParams.get("department")

    if (!department) {
      return NextResponse.json({ success: false, message: "Department is required" }, { status: 400 })
    }

    // Find queue for department
    const queue = await Queue.findOne({ department })

    if (!queue) {
      return NextResponse.json({ success: false, message: "Queue not found" }, { status: 404 })
    }

    // Find patient in queue
    const patientInQueue = queue.patientsInQueue.find((p) => p.patient.toString() === user._id.toString())

    if (!patientInQueue) {
      return NextResponse.json({ success: false, message: "Patient not in queue" }, { status: 404 })
    }

    // Calculate position in queue
    const position = queue.patientsInQueue.filter(
      (p) =>
        p.status === "waiting" &&
        (p.priority === patientInQueue.priority
          ? p.checkInTime <= patientInQueue.checkInTime
          : p.priority < patientInQueue.priority),
    ).length

    return NextResponse.json(
      {
        success: true,
        ticketNumber: patientInQueue.ticketNumber,
        status: patientInQueue.status,
        estimatedWaitTime: patientInQueue.estimatedWaitTime,
        queuePosition: position,
        checkInTime: patientInQueue.checkInTime,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Queue status error:", error)
    return NextResponse.json({ success: false, message: "Server error fetching queue status" }, { status: 500 })
  }
})

