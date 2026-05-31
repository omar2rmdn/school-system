import { Router } from "express";
import {
  createAttendance,
  getAttendances,
  getAttendance,
  updateAttendance,
  deleteAttendance,
} from "./controller";
import { auth, role } from "../../middleware/auth";

const router = Router();

router.post("/", auth, role("teacher"), createAttendance);
router.get("/", auth, getAttendances);
router.get("/:id", auth, getAttendance);
router.put("/:id", auth, role("teacher"), updateAttendance);
router.delete("/:id", auth, role("teacher"), deleteAttendance);

export { router as attendanceRouter };
