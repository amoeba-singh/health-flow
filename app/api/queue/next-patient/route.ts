import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Queue from "@/models/queue"
import { hasRole } from "@/lib/auth"

// Call the next patient in the queue
export const POST = hasRole(["admin", "doctor"])(async (req: NextRequest, user) => {
  try {
    await dbConnect()

    const body = await req.json()
    const { department } = body

    if (!department) {
      return NextResponse.json({ success: false, message: "Department is required" }, { status: 400 })
    }

    // Find queue for department
    const queue = await Queue.findOne({ department }).populate("patientsInQueue.patient", "name email phoneNumber")

    if (!queue || queue.patientsInQueue.length === 0) {
      return NextResponse.json({ success: false, message: "No patients in queue" }, { status: 404 })
    }

    // Find next waiting patient
    const waitingPatients = queue.patientsInQueue.filter((p) => p.status === "waiting")

    if (waitingPatients.length === 0) {
      return NextResponse.json({ success: false, message: "No waiting patients in queue" }, { status: 404 })
    }

    // Get the first waiting patient (already sorted by priority and check-in time)
    const nextPatient = waitingPatients[0]

    // Update patient status to in-progress
    const patientIndex = queue.patientsInQueue.findIndex(
      (p) => p.patient._id.toString() === nextPatient.patient._id.toString(),
    )

    queue.patientsInQueue[patientIndex].status = "in-progress"

    await queue.save()

    // Recalculate wait times for remaining patients
    for (let i = 0; i < queue.patientsInQueue.length; i++) {
      const patient = queue.patientsInQueue[i]

      if (patient.status === "waiting") {
        // Simple calculation: position in queue * average service time
        const position = queue.patientsInQueue.filter(
          (p) => p.status === "waiting" && p.checkInTime < patient.checkInTime,
        ).length

        const baseWaitTime = position * (queue.averageWaitTime || 15)

        // Adjust based on priority
        const priorityFactor =
          patient.priority === "emergency"
            ? 0.5
            : patient.priority === "high"
              ? 0.8
              : patient.priority === "medium"
                ? 1
                : 1.2

        queue.patientsInQueue[i].estimatedWaitTime = Math.round(baseWaitTime * priorityFactor)
      }
    }

    await queue.save()

    return NextResponse.json(
      {
        success: true,
        patient: nextPatient.patient,
        ticketNumber: nextPatient.ticketNumber,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Next patient error:", error)
    return NextResponse.json({ success: false, message: "Server error processing next patient" }, { status: 500 })
  }
})

