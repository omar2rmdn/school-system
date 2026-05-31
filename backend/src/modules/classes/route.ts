import { Router } from "express";
import {
  createClass,
  getClasses,
  getClass,
  updateClass,
  deleteClass,
} from "./controller";
import { auth, role } from "../../middleware/auth";

const router = Router();

router.post("/", auth, role("admin"), createClass);
router.get("/", auth, getClasses);
router.get("/:id", auth, getClass);
router.put("/:id", auth, role("admin"), updateClass);
router.delete("/:id", auth, role("admin"), deleteClass);

export { router as classRouter };