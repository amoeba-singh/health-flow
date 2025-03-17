import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Queue from "@/models/queue"
import User from "@/models/user"
import Appointment from "@/models/appointment"
import { isAuthenticated } from "@/lib/auth"
import { predictWaitTime } from "@/lib/ai-service"

// Check in a patient to a queue
export const POST = isAuthenticated(async (req: NextRequest, user) => {
  try {
    await dbConnect()

    const body = await req.json()
    const { appointmentId, patientId } = body

    // Validate required fields
    if (!appointmentId) {
      return NextResponse.json({ success: false, message: "Appointment ID is required" }, { status: 400 })
    }

    // Get appointment
    const appointment = await Appointment.findById(appointmentId)

    if (!appointment) {
      return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 })
    }

    // Check if user is authorized (admin, the patient, or checking in on behalf of patient)
    const patientToCheckIn = patientId || user._id

    if (
      user.role !== "admin" &&
      user.role !== "doctor" &&
      patientToCheckIn.toString() !== appointment.patient.toString()
    ) {
      return NextResponse.json({ success: false, message: "Not authorized to check in this patient" }, { status: 403 })
    }

    // Get doctor and department
    const doctor = await User.findById(appointment.doctor)

    if (!doctor || !doctor.department) {
      return NextResponse.json({ success: false, message: "Doctor or department not found" }, { status: 404 })
    }

    // Find or create queue for department
    let queue = await Queue.findOne({ department: doctor.department })

    if (!queue) {
      queue = new Queue({
        department: doctor.department,
        currentNumber: 1,
        patientsInQueue: [],
      })
    } else {
      // Check if patient is already in queue
      const existingPatient = queue.patientsInQueue.find((p) => p.patient.toString() === patientToCheckIn.toString())

      if (existingPatient) {
        return NextResponse.json(
          {
            success: true,
            message: "Patient already checked in",
            ticketNumber: existingPatient.ticketNumber,
            estimatedWaitTime: existingPatient.estimatedWaitTime,
          },
          { status: 200 },
        )
      }

      queue.currentNumber += 1
    }

    // Predict wait time using AI
    const currentDate = new Date()
    const waitTimePrediction = await predictWaitTime({
      currentQueueLength: queue.patientsInQueue.length,
      averageServiceTime: queue.averageWaitTime,
      patientPriority: appointment.priority,
      timeOfDay: `${currentDate.getHours()}:${currentDate.getMinutes()}`,
      dayOfWeek: currentDate.toLocaleDateString("en-US", { weekday: "long" }),
      staffAvailable: 3, // This would ideally come from a staff availability system
    })

    // Add patient to queue
    queue.patientsInQueue.push({
      patient: patientToCheckIn,
      ticketNumber: queue.currentNumber,
      estimatedWaitTime: waitTimePrediction.estimatedWaitTime,
      priority: appointment.priority,
      status: "waiting",
      checkInTime: new Date(),
    })

    // Sort queue by priority and check-in time
    queue.patientsInQueue.sort((a, b) => {
      const priorityOrder = { emergency: 0, high: 1, medium: 2, low: 3 }

      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }

      return a.checkInTime.getTime() - b.checkInTime.getTime()
    })

    await queue.save()

    // Update estimated wait times for all patients in queue
    for (let i = 0; i < queue.patientsInQueue.length; i++) {
      const patient = queue.patientsInQueue[i]

      if (patient.status === "waiting") {
        // Simple calculation: position in queue * average service time
        const position = i
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
        ticketNumber: queue.currentNumber,
        estimatedWaitTime: waitTimePrediction.estimatedWaitTime,
        queuePosition: queue.patientsInQueue.findIndex((p) => p.patient.toString() === patientToCheckIn.toString()) + 1,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Check-in error:", error)
    return NextResponse.json({ success: false, message: "Server error during check-in" }, { status: 500 })
  }
})

