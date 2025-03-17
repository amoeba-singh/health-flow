import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Appointment from "@/models/appointment"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const body = await req.json()
    
    const { department, doctor, date, description } = body

    // Basic validation
    if (!department || !doctor || !date || !description) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create the appointment with a default status of "scheduled"
    const appointment = await Appointment.create({
      department,
      doctor,
      date,
      description,
      status: "scheduled",
    })

    return NextResponse.json(
      { success: true, appointment },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error booking appointment:", error)
    return NextResponse.json(
      { success: false, message: "Server error booking appointment" },
      { status: 500 }
    )
  }
}