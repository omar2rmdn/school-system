import type { Request, Response } from "express";
import { FinalGrade } from "./model";
import { finalGradeSchema, finalGradeUpdateSchema } from "./validation";

async function createFinalGrade(req: Request, res: Response) {
  const { error, value } = finalGradeSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  const finalGrade = await FinalGrade.create(value);

  return res.status(201).json({
    message: "Final grade created successfully",
    data: finalGrade,
  });
}

async function getFinalGrades(req: Request, res: Response) {
  const { student, subject, academicYear, term } = req.query;

  const filter: Record<string, unknown> = {};
  if (student) filter.student = student;
  if (subject) filter.subject = subject;
  if (academicYear) filter.academicYear = academicYear;
  if (term) filter.term = term;

  const finalGrades = await FinalGrade.find(filter)
    .populate("student", "firstName lastName")
    .populate("subject", "name")
    .sort({ academicYear: -1, term: -1 });

  return res.status(200).json({
    count: finalGrades.length,
    data: finalGrades,
  });
}

async function getFinalGrade(req: Request, res: Response) {
  const finalGrade = await FinalGrade.findById(req.params.id)
    .populate("student", "firstName lastName")
    .populate("subject", "name");

  if (!finalGrade) {
    return res.status(404).json({ message: "Final grade not found" });
  }

  return res.status(200).json({ data: finalGrade });
}

async function getStudentFinalGrades(req: Request, res: Response) {
  const finalGrades = await FinalGrade.find({ student: String(req.params.studentId) })
    .populate("student", "firstName lastName")
    .populate("subject", "name")
    .sort({ academicYear: -1, term: -1 });

  return res.status(200).json({
    count: finalGrades.length,
    data: finalGrades,
  });
}

async function updateFinalGrade(req: Request, res: Response) {
  const { error, value } = finalGradeUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  const finalGrade = await FinalGrade.findByIdAndUpdate(req.params.id, value, {
    new: true,
    runValidators: true,
  })
    .populate("student", "firstName lastName")
    .populate("subject", "name");

  if (!finalGrade) {
    return res.status(404).json({ message: "Final grade not found" });
  }

  return res.status(200).json({
    message: "Final grade updated successfully",
    data: finalGrade,
  });
}

async function deleteFinalGrade(req: Request, res: Response) {
  const finalGrade = await FinalGrade.findByIdAndDelete(req.params.id);

  if (!finalGrade) {
    return res.status(404).json({ message: "Final grade not found" });
  }

  return res.status(200).json({ message: "Final grade deleted successfully" });
}

export {
  createFinalGrade,
  getFinalGrades,
  getFinalGrade,
  getStudentFinalGrades,
  updateFinalGrade,
  deleteFinalGrade,
};
