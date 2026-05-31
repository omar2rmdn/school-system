import type { Request, Response } from "express";
import { Attendance } from "./model";
import {
  attendanceCreationSchema,
  attendanceUpdateSchema,
} from "./validation";

async function createAttendance(req: Request, res: Response) {
  const { error, value } = attendanceCreationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  // Standardize dates to the start of the day so uniqueness checks stay consistent.
  // The unique index keys on student+class+subject+date.
  if (value.date) {
    const d = new Date(value.date);
    d.setHours(0, 0, 0, 0);
    value.date = d;
  } else {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    value.date = d;
  }

  try {
    const attendance = await Attendance.create(value);

    return res.status(201).json({
      message: "Attendance recorded successfully",
      data: attendance,
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({
        message:
          "Attendance record already exists for this student, class, subject, and date",
      });
    }
    throw err;
  }
}

async function getAttendances(req: Request, res: Response) {
  // Optional query params for filtering
  const { student, class: classId, subject, date } = req.query;
  const filter: any = {};

  if (student) filter.student = student;
  if (classId) filter.class = classId;
  if (subject) filter.subject = subject;
  if (date) {
    const d = new Date(date as string);
    d.setHours(0, 0, 0, 0);
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);
    filter.date = { $gte: d, $lt: nextDay };
  }

  const attendances = await Attendance.find(filter)
    .populate("student", "firstName lastName")
    .populate("class", "title")
    .populate("subject", "title")
    .sort({ date: -1 });

  return res.status(200).json({
    count: attendances.length,
    data: attendances,
  });
}

async function getAttendance(req: Request, res: Response) {
  const attendance = await Attendance.findById(req.params.id)
    .populate("student", "firstName lastName")
    .populate("class", "title")
    .populate("subject", "title");

  if (!attendance) {
    return res.status(404).json({
      message: "Attendance record not found",
    });
  }

  return res.status(200).json({
    data: attendance,
  });
}

async function updateAttendance(req: Request, res: Response) {
  const { error, value } = attendanceUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  if (value.date) {
    const d = new Date(value.date);
    d.setHours(0, 0, 0, 0);
    value.date = d;
  }

  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    })
      .populate("student", "firstName lastName")
      .populate("class", "title")
      .populate("subject", "title");

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    return res.status(200).json({
      message: "Attendance updated successfully",
      data: attendance,
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({
        message:
          "Attendance record already exists for this student, class, subject, and date",
      });
    }
    throw err;
  }
}

async function deleteAttendance(req: Request, res: Response) {
  const attendance = await Attendance.findByIdAndDelete(req.params.id);

  if (!attendance) {
    return res.status(404).json({
      message: "Attendance record not found",
    });
  }

  return res.status(200).json({
    message: "Attendance deleted successfully",
  });
}

export {
  createAttendance,
  getAttendances,
  getAttendance,
  updateAttendance,
  deleteAttendance,
};
