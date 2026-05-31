import { Router } from "express";
import { createComplaint, getComplaints, markAsRead } from "./controller";
import { auth, role } from "../../middleware/auth";

const router = Router();

router.post("/", auth, role("supervisor", "parent"), createComplaint);
router.get("/", auth, role("supervisor", "parent"), getComplaints);
router.patch("/:id/read", auth, role("supervisor", "parent"), markAsRead);

export { router as complaintRouter };
