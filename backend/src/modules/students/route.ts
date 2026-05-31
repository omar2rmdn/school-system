import { Router } from "express";
import {
  createStudent,
  getParentStudents,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
} from "./controller";
import { auth, role } from "../../middleware/auth";

const router = Router();

router.post("/", auth, role("admin"), createStudent);
router.get("/parent", auth, role("parent"), getParentStudents);
router.get("/", auth, getStudents);
router.get("/:id", auth, getStudent);
router.put("/:id", auth, role("admin"), updateStudent);
router.delete("/:id", auth, role("admin"), deleteStudent);

export { router as studentRouter };