import express from "express";
import {
  getAllTables,
  getOneTable,
  addTable,
  editTable,
  deleteTable,
} from "./controller";
import { auth, role } from "../../middleware/auth";

const router = express.Router();

router
  .route("/")
  .get(auth, role("admin", "teacher", "supervisor"), getAllTables)
  .post(auth, role("admin"), addTable);

router
  .route("/:id")
  .get(auth, getOneTable)
  .patch(auth, role("admin"), editTable)
  .delete(auth, role("admin"), deleteTable);

export { router as tableRouter };
