import { Router } from "express";
import {
  createTimetable,
  getTimetables,
  getTimetable,
  updateTimetable,
  deleteTimetable,
} from "./controller";
import { auth, role } from "../../middleware/auth";

const router = Router();

router.post("/", auth, role("admin"), createTimetable);
router.get("/", auth, getTimetables);
router.get("/:id", auth, getTimetable);
router.put("/:id", auth, role("admin"), updateTimetable);
router.delete("/:id", auth, role("admin"), deleteTimetable);

export { router as timetableRouter };
