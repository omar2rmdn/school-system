import mongoose, { Schema } from "mongoose";

export interface IComplaint {
  sender: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  title: string;
  description: string;
  isRead: boolean;
}

const complaintSchema = new Schema<IComplaint>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Complaint = mongoose.model<IComplaint>("Complaint", complaintSchema);

export { Complaint };
