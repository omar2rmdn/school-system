import express from "express";
import {
  getAllActivities,
  getOneActivity,
  addActivity,
  editActivity,
  deleteActivity,
} from "./controller";
import { auth, role } from "../../middleware/auth";

const router = express.Router();

router
  .route("/")
  .get(auth, getAllActivities)
  .post(auth, role("admin"), addActivity);

router
  .route("/:id")
  .get(auth, getOneActivity)
  .patch(auth, role("admin"), editActivity)
  .delete(auth, role("admin"), deleteActivity);

export { router as activityRouter };
