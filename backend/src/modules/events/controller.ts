import type { Request, Response } from "express";
import { Event } from "./model";
import { eventSchema, eventUpdateSchema } from "./validation";

async function createEvent(req: Request, res: Response) {
  const { error, value } = eventSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  const event = await Event.create(value);

  return res.status(201).json({
    message: "Event created successfully",
    data: event,
  });
}

async function getEvents(req: Request, res: Response) {
  const events = await Event.find().sort({ createdAt: -1 });

  return res.status(200).json({
    count: events.length,
    data: events,
  });
}

async function getEvent(req: Request, res: Response) {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      message: "Event not found",
    });
  }

  return res.status(200).json({
    data: event,
  });
}

async function updateEvent(req: Request, res: Response) {
  const { error, value } = eventUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  const event = await Event.findByIdAndUpdate(req.params.id, value, {
    new: true,
    runValidators: true,
  });

  if (!event) {
    return res.status(404).json({
      message: "Event not found",
    });
  }

  return res.status(200).json({
    message: "Event updated successfully",
    data: event,
  });
}

async function deleteEvent(req: Request, res: Response) {
  const event = await Event.findByIdAndDelete(req.params.id);

  if (!event) {
    return res.status(404).json({
      message: "Event not found",
    });
  }

  return res.status(200).json({
    message: "Event deleted successfully",
  });
}

export { createEvent, getEvents, getEvent, updateEvent, deleteEvent };
