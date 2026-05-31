import { Router } from "express";
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} from "./controller";
import { auth, role } from "../../middleware/auth";

const router = Router();

router.post("/", auth, role("admin", "supervisor"), createEvent);
router.get("/", auth, getEvents);
router.get("/:id", auth, getEvent);
router.put("/:id", auth, role("admin", "supervisor"), updateEvent);
router.delete("/:id", auth, role("admin", "supervisor"), deleteEvent);

export { router as eventRouter };