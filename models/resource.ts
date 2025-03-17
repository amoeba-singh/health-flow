import mongoose, { Schema, type Document } from "mongoose"

export interface IResource extends Document {
  name: string
  type: "room" | "equipment" | "staff"
  department: string
  status: "available" | "in-use" | "maintenance" | "unavailable"
  capacity?: number
  currentUsage?: number
  scheduledMaintenance?: Date
  lastUsed?: Date
}

const ResourceSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["room", "equipment", "staff"],
    },
    department: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["available", "in-use", "maintenance", "unavailable"],
      default: "available",
    },
    capacity: { type: Number },
    currentUsage: { type: Number, default: 0 },
    scheduledMaintenance: { type: Date },
    lastUsed: { type: Date },
  },
  { timestamps: true },
)

export default mongoose.models.Resource || mongoose.model<IResource>("Resource", ResourceSchema)

