import mongoose, { Schema } from "mongoose";

export interface IDaySlot {
  day: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday";
  subject: mongoose.Types.ObjectId;
  startTime: string;
  endTime: string;
}

export interface ITimetable {
  class: mongoose.Types.ObjectId;
  days: IDaySlot[];
}

const daySlotSchema = new Schema<IDaySlot>(
  {
    day: {
      type: String,
      required: [true, "Day is required"],
      enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      trim: true,
    },
  },
  { _id: false }
);

const timetableSchema = new Schema<ITimetable>(
  {
    class: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class is required"],
    },
    days: {
      type: [daySlotSchema],
      required: [true, "Days are required"],
      validate: [(val: IDaySlot[]) => val.length > 0, "At least one day slot is required"],
    },
  },
  {
    timestamps: true,
  }
);

timetableSchema.index({ class: 1 }, { unique: true });
timetableSchema.index({ class: 1, "days.day": 1, "days.startTime": 1 }, { unique: true });

const Timetable = mongoose.model<ITimetable>("Timetable", timetableSchema);

export { Timetable };
