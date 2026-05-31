import mongoose, { Schema } from "mongoose";

export interface ISubject {
  title: string;
}

const subjectSchema = new Schema<ISubject>(
  {
    title: {
      type: String,
      required: [true, "Subject title is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
  },
  {
    timestamps: true,
  },
);

const Subject = mongoose.model<ISubject>("Subject", subjectSchema);

export { Subject };
