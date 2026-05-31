import type { Request, Response } from "express";
import { Class } from "./model";
import { classSchema, classUpdateSchema } from "./validation";

async function createClass(req: Request, res: Response) {
  const { error, value } = classSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  const { title } = value;

  const existingClass = await Class.findOne({ title });
  if (existingClass) {
    return res.status(400).json({
      message: "Class already exists with this title",
    });
  }

  const classDoc = await Class.create({ title });

  return res.status(201).json({
    message: "Class created successfully",
    data: classDoc,
  });
}

async function getClasses(req: Request, res: Response) {
  const classes = await Class.find().sort({ title: 1 });

  return res.status(200).json({
    count: classes.length,
    data: classes,
  });
}

async function getClass(req: Request, res: Response) {
  const classDoc = await Class.findById(req.params.id);

  if (!classDoc) {
    return res.status(404).json({
      message: "Class not found",
    });
  }

  return res.status(200).json({
    data: classDoc,
  });
}

async function updateClass(req: Request, res: Response) {
  const { error, value } = classUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  if (value.title) {
    const existingClass = await Class.findOne({
      title: value.title,
      _id: { $ne: req.params.id },
    });
    if (existingClass) {
      return res.status(400).json({
        message: "Class already exists with this title",
      });
    }
  }

  const classDoc = await Class.findByIdAndUpdate(req.params.id, value, {
    new: true,
    runValidators: true,
  });

  if (!classDoc) {
    return res.status(404).json({
      message: "Class not found",
    });
  }

  return res.status(200).json({
    message: "Class updated successfully",
    data: classDoc,
  });
}

async function deleteClass(req: Request, res: Response) {
  const classDoc = await Class.findByIdAndDelete(req.params.id);

  if (!classDoc) {
    return res.status(404).json({
      message: "Class not found",
    });
  }

  return res.status(200).json({
    message: "Class deleted successfully",
  });
}

export {
  createClass,
  getClasses,
  getClass,
  updateClass,
  deleteClass,
};