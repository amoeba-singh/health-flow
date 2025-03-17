import mongoose, { Schema, type Document } from "mongoose"

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId
  doctor: mongoose.Types.ObjectId
  date: Date
  startTime: string
  endTime: string
  status: "scheduled" | "completed" | "cancelled" | "no-show"
  reason: string
  notes?: string
  priority: "low" | "medium" | "high" | "emergency"
  estimatedWaitTime?: number
  actualWaitTime?: number
}

const AppointmentSchema: Schema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "User", required: true, default: "akash" },
    doctor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["scheduled", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    reason: { type: String, required: true },
    // notes: { type: String },
    // priority: {
    //   type: String,
    //   required: true,
    //   enum: ["low", "medium", "high", "emergency"],
    //   default: "medium",
    // },
    // estimatedWaitTime: { type: Number }, // in minutes
    // actualWaitTime: { type: Number }, // in minutes
  },
  { timestamps: true },
)

export default mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", AppointmentSchema)

