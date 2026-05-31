import express from "express";
import {
  getAllNews,
  getOneNews,
  addNews,
  editNews,
  deleteNews,
} from "./controller";
import { auth, role } from "../../middleware/auth";

const router = express.Router();

router.route("/").get(auth, getAllNews).post(auth, role("admin"), addNews);

router
  .route("/:id")
  .get(auth, getOneNews)
  .patch(auth, role("admin"), editNews)
  .delete(auth, role("admin"), deleteNews);

export { router as newsRouter };
