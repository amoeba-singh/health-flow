import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Appointment from "@/models/appointment"
import { isAuthenticated } from "@/lib/auth"
import Queue from "@/models/queue"
import User from "@/models/user"

// Get a specific appointment
export const GET = isAuthenticated(async (req: NextRequest, user) => {
  try {
    await dbConnect()

    const id = req.url.split("/").pop()

    const appointment = await Appointment.findById(id)
      .populate("patient", "name email phoneNumber")
      .populate("doctor", "name specialty department")

    if (!appointment) {
      return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 })
    }

    // Check if user is authorized to view this appointment
    if (
      user.role !== "admin" &&
      appointment.patient._id.toString() !== user._id.toString() &&
      appointment.doctor._id.toString() !== user._id.toString()
    ) {
      return NextResponse.json({ success: false, message: "Not authorized to view this appointment" }, { status: 403 })
    }

    return NextResponse.json({ success: true, appointment }, { status: 200 })
  } catch (error) {
    console.error("Get appointment error:", error)
    return NextResponse.json({ success: false, message: "Server error fetching appointment" }, { status: 500 })
  }
})

// Update an appointment
export const PUT = isAuthenticated(async (req: NextRequest, user) => {
  try {
    await dbConnect()

    const id = req.url.split("/").pop()
    const body = await req.json()

    const appointment = await Appointment.findById(id)

    if (!appointment) {
      return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 })
    }

    // Check if user is authorized to update this appointment
    if (
      user.role !== "admin" &&
      appointment.patient.toString() !== user._id.toString() &&
      appointment.doctor.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { success: false, message: "Not authorized to update this appointment" },
        { status: 403 },
      )
    }

    // Update appointment fields
    const { status, notes, reason, priority } = body

    if (status) appointment.status = status
    if (notes) appointment.notes = notes
    if (reason) appointment.reason = reason
    if (priority) appointment.priority = priority

    await appointment.save()

    // Update queue if status changed to completed or cancelled
    if (status === "completed" || status === "cancelled" || status === "no-show") {
      const doctor = await User.findById(appointment.doctor)
      const queue = await Queue.findOne({ department: doctor.department })

      // if (queue) {
      //   // Find and update patient in queue
      //   const patientIndex = queue.patientsInQueue.findIndex(
      //     (p) => p.patient.toString() === appointment.patient.toString(),
      //   )

      //   if (patientIndex !== -1) {
      //     queue.patientsInQueue[patientIndex].status = status === "completed" ? "completed" : "no-show"
      //     await queue.save()
      //   }
      // }
    }

    return NextResponse.json({ success: true, appointment }, { status: 200 })
  } catch (error) {
    console.error("Update appointment error:", error)
    return NextResponse.json({ success: false, message: "Server error updating appointment" }, { status: 500 })
  }
})

// Delete an appointment
export const DELETE = isAuthenticated(async (req: NextRequest, user) => {
  try {
    await dbConnect()

    const id = req.url.split("/").pop()

    const appointment = await Appointment.findById(id)

    if (!appointment) {
      return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 })
    }

    // Check if user is authorized to delete this appointment
    if (user.role !== "admin" && appointment.patient.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Not authorized to delete this appointment" },
        { status: 403 },
      )
    }

    // Remove from queue if in queue
    const doctor = await User.findById(appointment.doctor)
    const queue = await Queue.findOne({ department: doctor.department })

    // if (queue) {
    //   queue.patientsInQueue = queue.patientsInQueue.filter(
    //     (p) => p.patient.toString() !== appointment.patient.toString(),
    //   )
    //   await queue.save()
    // }

    await Appointment.findByIdAndDelete(id)

    return NextResponse.json({ success: true, message: "Appointment deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Delete appointment error:", error)
    return NextResponse.json({ success: false, message: "Server error deleting appointment" }, { status: 500 })
  }
})

