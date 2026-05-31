import mongoose, { Schema } from "mongoose";

export interface IClass {
  title: string;
}

const classSchema = new Schema<IClass>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

const Class = mongoose.model<IClass>("Class", classSchema);

export { Class };
