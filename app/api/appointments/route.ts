import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Appointment from "@/models/appointment"
import { isAuthenticated, hasRole } from "@/lib/auth"
import { predictWaitTime } from "@/lib/ai-service"
import Queue from "@/models/queue"
import User from "@/models/user"

// Get all appointments (admin and doctors)
// export const GET = hasRole(["admin", "doctor"])(async (req: NextRequest) => {
//   try {
//     await dbConnect()

//     const { searchParams } = new URL(req.url)
//     const date = searchParams.get("date")
//     const doctorId = searchParams.get("doctor")
//     const status = searchParams.get("status")

//     const query: any = {}

//     if (date) {
//       const startDate = new Date(date)
//       startDate.setHours(0, 0, 0, 0)

//       const endDate = new Date(date)
//       endDate.setHours(23, 59, 59, 999)

//       query.date = { $gte: startDate, $lte: endDate }
//     }

//     if (doctorId) {
//       query.doctor = doctorId
//     }

//     if (status) {
//       query.status = status
//     }

//     const appointments = await Appointment.find(query)
//       .populate("patient", "name email phoneNumber")
//       .populate("doctor", "name specialty department")
//       .sort({ date: 1, startTime: 1 })

//     return NextResponse.json({ success: true, appointments }, { status: 200 })
//   } catch (error) {
//     console.error("Get appointments error:", error)
//     return NextResponse.json({ success: false, message: "Server error fetching appointments" }, { status: 500 })
//   }
// })

// Create a new appointment
export const POST = isAuthenticated(async (req: NextRequest, user) => {
  try {
    await dbConnect()

    const body = await req.json()
    const { doctorId, date, reason} = body

    // Validate required fields
    if (!doctorId || !date || !reason) {
      return NextResponse.json({ success: false, message: "Missing required appointment fields" }, { status: 400 })
    }

    // Check if doctor exists
    // const doctor = await User.findOne({ _id: doctorId, role: "doctor" })
    // if (!doctor) {
    //   return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
    // }

    // Check for conflicting appointments
    const appointmentDate = new Date(date)
    

    // Get department queue data for wait time prediction
    // const departmentQueue = await Queue.findOne({ department: doctor.department })

    // Predict wait time using AI
    const currentDate = new Date()
    // const waitTimePrediction = await predictWaitTime({
    //   currentQueueLength: departmentQueue ? departmentQueue.patientsInQueue.length : 0,
    //   averageServiceTime: departmentQueue ? departmentQueue.averageWaitTime : 15,
    //   patientPriority: priority || "medium",
    //   timeOfDay: `${currentDate.getHours()}:${currentDate.getMinutes()}`,
    //   dayOfWeek: currentDate.toLocaleDateString("en-US", { weekday: "long" }),
    //   staffAvailable: 3, // This would ideally come from a staff availability system
    // })

    // Create new appointment
    const appointment = new Appointment({
      patient: user._id,
      doctor: doctorId,
      date: new Date(date),
      reason,
      // priority: priority || "medium",
      // estimatedWaitTime: waitTimePrediction.estimatedWaitTime,
    })

    await appointment.save()

    // Add to queue if appointment is for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const appointmentDay = new Date(date)
    appointmentDay.setHours(0, 0, 0, 0)

    // if (appointmentDay.getTime() === today.getTime()) {
    //   if (!departmentQueue) {
    //     // Create queue if it doesn't exist
    //     const newQueue = new Queue({
    //       department: doctor.department,
    //       currentNumber: 1,
    //       patientsInQueue: [
    //         {
    //           patient: user._id,
    //           ticketNumber: 1,
    //           estimatedWaitTime: waitTimePrediction.estimatedWaitTime,
    //           priority: priority || "medium",
    //           checkInTime: new Date(),
    //         },
    //       ],
    //     })
    //     await newQueue.save()
    //   } else {
    //     // Add to existing queue
    //     departmentQueue.currentNumber += 1
    //     departmentQueue.patientsInQueue.push({
    //       patient: user._id,
    //       ticketNumber: departmentQueue.currentNumber,
    //       estimatedWaitTime: waitTimePrediction.estimatedWaitTime,
    //       priority: priority || "medium",
    //       checkInTime: new Date(),
    //     })
    //     await departmentQueue.save()
    //   }
    // }

    return NextResponse.json(
      {
        success: true,
        appointment,
        // estimatedWaitTime: waitTimePrediction.estimatedWaitTime,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create appointment error:", error)
    return NextResponse.json({ success: false, message: "Server error creating appointment" }, { status: 500 })
  }
})

