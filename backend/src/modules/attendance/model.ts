import mongoose, { Schema } from "mongoose";

export interface IAttendance {
  student: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  date: Date;
  status: "present" | "absent" | "late" | "excused";
}

const attendanceSchema = new Schema<IAttendance>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student is required"],
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class is required"],
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["present", "absent", "late", "excused"],
        message: "{VALUE} is not a supported status",
      },
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate attendance records for the same student, class, subject, and date
attendanceSchema.index(
  { student: 1, class: 1, subject: 1, date: 1 },
  { unique: true },
);

const Attendance = mongoose.model<IAttendance>("Attendance", attendanceSchema);

export { Attendance };
