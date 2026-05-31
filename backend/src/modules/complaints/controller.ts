import type { Request, Response } from "express";
import { Complaint } from "./model";
import { Student } from "../students/model";
import { User } from "../users/model";
import { createComplaintSchema } from "./validation";
import mongoose from "mongoose";

export const createComplaint = async (req: Request, res: Response) => {
  const { error } = createComplaintSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: error.details?.[0]?.message || "Validation error" });
  }

  const { studentId, title, description } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const senderId = req.user._id;
  const senderRole = req.user.role;

  const student = await Student.findById(studentId);
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  if (senderRole === "parent") {
    const parentUser = await User.findById(senderId);
    if (parentUser?.phone !== student.parentPhone) {
      return res.status(403).json({
        message:
          "You are not authorized to create a complaint for this student",
      });
    }
  }

  const complaint = await Complaint.create({
    sender: senderId,
    student: studentId,
    title,
    description,
  });

  res.status(201).json(complaint);
};

export const getComplaints = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const userId = req.user._id;
  const userRole = req.user.role;
  const { studentId } = req.query;

  let query: any = {};

  if (userRole === "parent") {
    if (!studentId) {
      return res.status(400).json({
        message: "studentId query parameter is required for parents",
      });
    }

    const parentUser = await User.findById(userId);
    const student = await Student.findById(studentId);

    if (!student || student.parentPhone !== parentUser?.phone) {
      return res
        .status(403)
        .json({ message: "Not authorized for this student" });
    }

    query.student = studentId;
  } else if (userRole === "supervisor") {
    if (studentId) {
      query.student = studentId;
    }
    // If no studentId, query remains empty so supervisors see all complaints
  } else {
    return res
      .status(403)
      .json({ message: "Only supervisors and parents can view complaints" });
  }

  const complaints = await Complaint.find(query)
    .populate("sender", "firstName lastName role")
    .populate("student", "firstName lastName")
    .sort({ createdAt: -1 });

  res.json(complaints);
};

export const markAsRead = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const { id } = req.params;
  if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid complaint ID" });
  }

  const complaint = await Complaint.findById(id).populate("student");

  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found" });
  }

  if (complaint.sender.toString() === req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Cannot mark your own complaint as read" });
  }

  const user = await User.findById(req.user._id);
  const student = complaint.student as any;
  let authorized = false;

  if (req.user.role === "parent") {
    if (user?.phone === student.parentPhone) {
      authorized = true;
    }
  } else if (req.user.role === "supervisor") {
    // Supervisors can read/manage any student's complaints
    authorized = true;
  }

  if (!authorized) {
    return res
      .status(403)
      .json({ message: "Not authorized to modify this complaint" });
  }

  complaint.isRead = true;
  await complaint.save();

  res.json(complaint);
};
