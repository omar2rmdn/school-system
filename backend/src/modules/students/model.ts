import mongoose, { Schema } from "mongoose";

export interface IStudent {
  firstName: string;
  lastName: string;
  class: mongoose.Types.ObjectId;
  parentPhone: string;
}

const studentSchema = new Schema<IStudent>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class is required"],
    },
    parentPhone: {
      type: String,
      required: [true, "Parent phone is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Student = mongoose.model<IStudent>("Student", studentSchema);

export { Student };
