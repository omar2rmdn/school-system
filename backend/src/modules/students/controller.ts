import type { Request, Response } from "express";
import { Student } from "./model";
import { User } from "../users/model";
import { studentSchema, studentUpdateSchema } from "./validation";

async function createStudent(req: Request, res: Response) {
  const { error, value } = studentSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  const student = await Student.create({
    ...value,
  });

  return res.status(201).json({
    message: "Student created successfully",
    data: student,
  });
}

async function getStudents(req: Request, res: Response) {
  const { class: classId } = req.query;

  const filter: Record<string, unknown> = {};
  if (classId) filter.class = classId;

  const students = await Student.find(filter)
    .populate("class", "title")
    .sort({ lastName: 1, firstName: 1 });

  return res.status(200).json({
    count: students.length,
    data: students,
  });
}

async function getStudent(req: Request, res: Response) {
  const student = await Student.findById(req.params.id).populate(
    "class",
    "title",
  );

  if (!student) {
    return res.status(404).json({
      message: "Student not found",
    });
  }

  return res.status(200).json({
    data: student,
  });
}

async function updateStudent(req: Request, res: Response) {
  const { error, value } = studentUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  const student = await Student.findByIdAndUpdate(req.params.id, value, {
    new: true,
    runValidators: true,
  }).populate("class", "title");

  if (!student) {
    return res.status(404).json({
      message: "Student not found",
    });
  }

  return res.status(200).json({
    message: "Student updated successfully",
    data: student,
  });
}

async function deleteStudent(req: Request, res: Response) {
  const student = await Student.findByIdAndDelete(req.params.id);

  if (!student) {
    return res.status(404).json({
      message: "Student not found",
    });
  }

  return res.status(200).json({
    message: "Student deleted successfully",
  });
}

async function getParentStudents(req: Request, res: Response) {
  const user = await User.findById(req.user?._id);

  if (!user || !user.phone) {
    return res.status(404).json({
      message: "Parent user or phone number not found",
    });
  }

  const students = await Student.find({ parentPhone: user.phone })
    .populate("class", "title")
    .sort({ lastName: 1, firstName: 1 });

  return res.status(200).json({
    count: students.length,
    data: students,
  });
}

export {
  getParentStudents,
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
};
