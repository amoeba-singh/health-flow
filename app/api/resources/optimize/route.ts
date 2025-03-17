import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Resource from "@/models/resource"
import Appointment from "@/models/appointment"
import { hasRole } from "@/lib/auth"
import { optimizeResourceAllocation } from "@/lib/ai-service"

// Get optimized resource allocation
export const POST = hasRole(["admin", "doctor"])(async (req: NextRequest) => {
  try {
    await dbConnect()

    const body = await req.json()
    const { department } = body

    if (!department) {
      return NextResponse.json({ success: false, message: "Department is required" }, { status: 400 })
    }

    // Get current resources for department
    const resources = await Resource.find({ department })

    // Get upcoming appointments
    const now = new Date()
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    const upcomingAppointments = await Appointment.find({
      date: { $gte: now, $lte: twoHoursLater },
      status: "scheduled",
    }).populate("doctor", "department")

    // Filter appointments for this department
    const departmentAppointments = upcomingAppointments.filter((a) => a.doctor.department === department)

    // Calculate resource metrics
    const availableRooms = resources.filter((r) => r.type === "room" && r.status === "available").length

    const availableStaff = resources.filter((r) => r.type === "staff" && r.status === "available").length

    const equipmentUtilization =
      resources
        .filter((r) => r.type === "equipment")
        .reduce((total, resource) => total + resource.currentUsage / (resource.capacity || 1), 0) /
      Math.max(1, resources.filter((r) => r.type === "equipment").length)

    // Get AI optimization recommendations
    const optimization = await optimizeResourceAllocation({
      department,
      currentPatients: departmentAppointments.length,
      availableRooms,
      availableStaff,
      equipmentUtilization,
      upcomingAppointments: departmentAppointments.length,
      emergencyCasesProbability: 0.2, // This would ideally be calculated based on historical data
    })

    return NextResponse.json(
      {
        success: true,
        currentResources: {
          rooms: availableRooms,
          staff: availableStaff,
          equipmentUtilization,
        },
        optimization,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Resource optimization error:", error)
    return NextResponse.json({ success: false, message: "Server error optimizing resources" }, { status: 500 })
  }
})

