import { Router } from "express";
import {
  createSubject,
  getSubjects,
  getSubject,
  updateSubject,
  deleteSubject,
} from "./controller";
import { auth, role } from "../../middleware/auth";

const router = Router();

router.post("/", auth, role("admin"), createSubject);
router.get("/", auth, getSubjects);
router.get("/:id", auth, getSubject);
router.put("/:id", auth, role("admin"), updateSubject);
router.delete("/:id", auth, role("admin"), deleteSubject);

export { router as subjectRouter };