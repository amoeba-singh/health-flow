import mongoose, { Schema, type Document } from "mongoose"

export interface IQueue extends Document {
  department: string
  currentNumber: number
  lastUpdated: Date
  averageWaitTime: number // in minutes
  patientsInQueue: Array<{
    patient: mongoose.Types.ObjectId
    ticketNumber: number
    estimatedWaitTime: number
    priority: "low" | "medium" | "high" | "emergency"
    status: "waiting" | "in-progress" | "completed" | "no-show"
    checkInTime: Date
  }>
}

const QueueSchema: Schema = new Schema(
  {
    department: { type: String, required: true, unique: true },
    currentNumber: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    averageWaitTime: { type: Number, default: 15 }, // default 15 minutes
    patientsInQueue: [
      {
        patient: { type: Schema.Types.ObjectId, ref: "User", required: true },
        ticketNumber: { type: Number, required: true },
        estimatedWaitTime: { type: Number, required: true }, // in minutes
        priority: {
          type: String,
          required: true,
          enum: ["low", "medium", "high", "emergency"],
          default: "medium",
        },
        status: {
          type: String,
          required: true,
          enum: ["waiting", "in-progress", "completed", "no-show"],
          default: "waiting",
        },
        checkInTime: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
)

export default mongoose.models.Queue || mongoose.model<IQueue>("Queue", QueueSchema)

