import { Router } from "express";
import {
  createFinalGrade,
  getFinalGrades,
  getFinalGrade,
  updateFinalGrade,
  deleteFinalGrade,
  getStudentFinalGrades,
} from "./controller";
import { auth, role } from "../../middleware/auth";

const router = Router();

router.post("/", auth, role("teacher"), createFinalGrade);
router.get("/", auth, getFinalGrades);
router.get("/student/:studentId", auth, role("parent"), getStudentFinalGrades);
router.get("/:id", auth, getFinalGrade);
router.put("/:id", auth, role("teacher"), updateFinalGrade);
router.delete("/:id", auth, role("teacher"), deleteFinalGrade);

export { router as finalGradeRouter };
