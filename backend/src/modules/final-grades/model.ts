import mongoose, { Schema } from "mongoose";

export interface IFinalGrade {
  student: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  academicYear: string;
  term: "first" | "second";
  score: number;
}

const finalGradeSchema = new Schema<IFinalGrade>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student is required"],
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject is required"],
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      trim: true,
    },
    term: {
      type: String,
      enum: ["first", "second"],
      required: [true, "Term is required"],
      trim: true,
    },
    score: {
      type: Number,
      required: [true, "Score is required"],
      min: [0, "Score cannot be less than 0"],
      max: [100, "Score cannot be greater than 100"],
    },
  },
  {
    timestamps: true,
  },
);

finalGradeSchema.index(
  { student: 1, subject: 1, academicYear: 1, term: 1 },
  { unique: true },
);

const FinalGrade = mongoose.model<IFinalGrade>("FinalGrade", finalGradeSchema);

export { FinalGrade };
