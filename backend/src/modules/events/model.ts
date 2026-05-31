import mongoose, { Schema } from "mongoose";

export interface IEvent {
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
  },
  {
    timestamps: true,
  },
);

const Event = mongoose.model<IEvent>("Event", eventSchema);

export { Event };