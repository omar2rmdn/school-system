import type { Request, Response } from "express";
import { Timetable } from "./model";
import { timetableSchema, timetableUpdateSchema } from "./validation";

async function createTimetable(req: Request, res: Response) {
  const { error, value } = timetableSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  const timetable = await Timetable.create(value);

  return res.status(201).json({
    message: "Timetable entry created successfully",
    data: timetable,
  });
}

async function getTimetables(req: Request, res: Response) {
  const { class: classId, day } = req.query;

  const filter: Record<string, unknown> = {};
  if (classId) filter.class = classId;
  if (day) filter["days.day"] = day;

  const timetables = await Timetable.find(filter)
    .populate("class", "title")
    .populate("days.subject", "title");

  return res.status(200).json({
    count: timetables.length,
    data: timetables,
  });
}

async function getTimetable(req: Request, res: Response) {
  const timetable = await Timetable.findById(req.params.id)
    .populate("class", "title")
    .populate("days.subject", "title");

  if (!timetable) {
    return res.status(404).json({ message: "Timetable entry not found" });
  }

  return res.status(200).json({ data: timetable });
}

async function updateTimetable(req: Request, res: Response) {
  const { error, value } = timetableUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  const timetable = await Timetable.findByIdAndUpdate(req.params.id, value, {
    new: true,
    runValidators: true,
  })
    .populate("class", "title")
    .populate("days.subject", "title");

  if (!timetable) {
    return res.status(404).json({ message: "Timetable entry not found" });
  }

  return res.status(200).json({
    message: "Timetable entry updated successfully",
    data: timetable,
  });
}

async function deleteTimetable(req: Request, res: Response) {
  const timetable = await Timetable.findByIdAndDelete(req.params.id);

  if (!timetable) {
    return res.status(404).json({ message: "Timetable entry not found" });
  }

  return res.status(200).json({ message: "Timetable entry deleted successfully" });
}

export {
  createTimetable,
  getTimetables,
  getTimetable,
  updateTimetable,
  deleteTimetable,
};
