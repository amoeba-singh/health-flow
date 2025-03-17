import { GoogleGenerativeAI } from "@google/generative-ai"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!

if (!GEMINI_API_KEY) {
  throw new Error("Please define the GEMINI_API_KEY environment variable")
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

export async function predictWaitTime(queueData: {
  currentQueueLength: number
  averageServiceTime: number
  patientPriority: string
  timeOfDay: string
  dayOfWeek: string
  staffAvailable: number
  historicalData?: string
}) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
      As an AI healthcare queue management system, predict the wait time in minutes for a patient with the following data:
      
      Current queue length: ${queueData.currentQueueLength} patients
      Average service time per patient: ${queueData.averageServiceTime} minutes
      Patient priority: ${queueData.patientPriority} (low, medium, high, or emergency)
      Time of day: ${queueData.timeOfDay}
      Day of week: ${queueData.dayOfWeek}
      Staff available: ${queueData.staffAvailable} healthcare providers
      
      ${queueData.historicalData ? `Historical data: ${queueData.historicalData}` : ""}
      
      Provide your prediction as a JSON object with the following structure:
      {
        "estimatedWaitTime": number (in minutes),
        "confidenceScore": number (between 0 and 1),
        "factors": [string] (list of factors that influenced this prediction),
        "recommendations": [string] (list of recommendations to improve wait time)
      }
      
      Only return the JSON object, no additional text.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error("AI prediction error:", error)
    // Fallback to a simple calculation if AI fails
    const baseTime = queueData.currentQueueLength * queueData.averageServiceTime
    const priorityFactor =
      queueData.patientPriority === "emergency"
        ? 0.2
        : queueData.patientPriority === "high"
          ? 0.5
          : queueData.patientPriority === "medium"
            ? 1
            : 1.2

    const staffFactor = Math.max(1, queueData.staffAvailable) / 2

    return {
      estimatedWaitTime: Math.round((baseTime * priorityFactor) / staffFactor),
      confidenceScore: 0.6,
      factors: ["queue length", "priority", "staff availability"],
      recommendations: ["Increase staff if possible", "Review patient priorities"],
    }
  }
}

export async function optimizeResourceAllocation(resourceData: {
  department: string
  currentPatients: number
  availableRooms: number
  availableStaff: number
  equipmentUtilization: number
  upcomingAppointments: number
  emergencyCasesProbability: number
}) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
      As an AI healthcare resource optimization system, provide recommendations for optimal resource allocation with the following data:
      
      Department: ${resourceData.department}
      Current patients: ${resourceData.currentPatients}
      Available rooms: ${resourceData.availableRooms}
      Available staff: ${resourceData.availableStaff}
      Equipment utilization: ${resourceData.equipmentUtilization * 100}%
      Upcoming appointments in next 2 hours: ${resourceData.upcomingAppointments}
      Probability of emergency cases: ${resourceData.emergencyCasesProbability * 100}%
      
      Provide your recommendations as a JSON object with the following structure:
      {
        "recommendedStaffAllocation": number,
        "recommendedRoomAllocation": number,
        "equipmentPrioritization": [string],
        "bottlenecks": [string],
        "efficiencyScore": number (between 0 and 1),
        "recommendations": [string]
      }
      
      Only return the JSON object, no additional text.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error("AI optimization error:", error)
    // Fallback to a simple calculation if AI fails
    return {
      recommendedStaffAllocation:
        Math.ceil(resourceData.currentPatients / 4) + Math.ceil(resourceData.upcomingAppointments / 8),
      recommendedRoomAllocation: Math.ceil(resourceData.currentPatients / 2),
      equipmentPrioritization: ["Critical care equipment", "Diagnostic tools"],
      bottlenecks: resourceData.availableRooms < resourceData.currentPatients / 2 ? ["Room availability"] : [],
      efficiencyScore: 0.7,
      recommendations: ["Adjust staff scheduling based on patient load", "Prepare for potential emergency cases"],
    }
  }
}

