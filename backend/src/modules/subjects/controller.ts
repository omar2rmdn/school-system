import type { Request, Response } from "express";
import { Subject } from "./model";
import { subjectSchema, subjectUpdateSchema } from "./validation";

async function createSubject(req: Request, res: Response) {
  const { error, value } = subjectSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  const { title } = value;

  const existingSubject = await Subject.findOne({ title });
  if (existingSubject) {
    return res.status(400).json({
      message: "Subject already exists with this title",
    });
  }

  const subject = await Subject.create({ title });

  return res.status(201).json({
    message: "Subject created successfully",
    data: subject,
  });
}

async function getSubjects(req: Request, res: Response) {
  const subjects = await Subject.find().sort({ title: 1 });

  return res.status(200).json({
    count: subjects.length,
    data: subjects,
  });
}

async function getSubject(req: Request, res: Response) {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    return res.status(404).json({
      message: "Subject not found",
    });
  }

  return res.status(200).json({
    data: subject,
  });
}

async function updateSubject(req: Request, res: Response) {
  const { error, value } = subjectUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  if (value.title) {
    const existingSubject = await Subject.findOne({
      title: value.title,
      _id: { $ne: req.params.id },
    });
    if (existingSubject) {
      return res.status(400).json({
        message: "Subject already exists with this title",
      });
    }
  }

  const subject = await Subject.findByIdAndUpdate(req.params.id, value, {
    new: true,
    runValidators: true,
  });

  if (!subject) {
    return res.status(404).json({
      message: "Subject not found",
    });
  }

  return res.status(200).json({
    message: "Subject updated successfully",
    data: subject,
  });
}

async function deleteSubject(req: Request, res: Response) {
  const subject = await Subject.findByIdAndDelete(req.params.id);

  if (!subject) {
    return res.status(404).json({
      message: "Subject not found",
    });
  }

  return res.status(200).json({
    message: "Subject deleted successfully",
  });
}

export {
  createSubject,
  getSubjects,
  getSubject,
  updateSubject,
  deleteSubject,
};