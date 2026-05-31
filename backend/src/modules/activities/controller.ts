import type { Request, Response } from "express";
import { Activity } from "./model";
import { createActivitySchema, updateActivitySchema } from "./validation";

async function getAllActivities(req: Request, res: Response) {
  const activities = await Activity.find().sort({ createdAt: -1 }).select("-__v");
  return res.status(200).json({
    message: "activities sent successfully",
    data: { activities },
  });
}

async function getOneActivity(req: Request, res: Response) {
  const { id } = req.params;
  const activity = await Activity.findById(id).select("-__v");
  if (!activity) {
    return res.status(404).json({ message: "Activity not found" });
  }
  return res.status(200).json({
    message: "activity sent successfully",
    data: { activity },
  });
}

async function addActivity(req: Request, res: Response) {
  const { error } = createActivitySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const activity = new Activity(req.body);
  await activity.save();

  return res.status(201).json({
    message: "activity created successfully",
    data: { activity: activity.toObject() },
  });
}

async function editActivity(req: Request, res: Response) {
  const { error } = updateActivitySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const { id } = req.params;
  const activity = await Activity.findById(id);
  if (!activity) {
    return res.status(404).json({ message: "Activity not found" });
  }

  const updatedActivity = await Activity.findByIdAndUpdate(id, req.body, {
    new: true,
  }).select("-__v");

  return res.status(200).json({
    message: "activity updated successfully",
    data: { activity: updatedActivity },
  });
}

async function deleteActivity(req: Request, res: Response) {
  const { id } = req.params;
  const activity = await Activity.findByIdAndDelete(id);
  if (!activity) {
    return res.status(404).json({ message: "Activity not found" });
  }
  return res.status(200).json({ message: "activity deleted successfully" });
}

export { getAllActivities, getOneActivity, addActivity, editActivity, deleteActivity };