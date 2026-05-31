import { Router } from "express";
import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  loginUser,
  logoutUser,
  getMe,
  refresh,
} from "./controller";
import { auth, role } from "../../middleware/auth";

const router = Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/", auth, role("admin"), createUser);
router.get("/", auth, role("admin"), getUsers);
router.get("/me", auth, getMe);
router.get("/refresh", refresh);
router.get("/:id", auth, role("admin"), getUser);
router.put("/:id", auth, role("admin"), updateUser);
router.delete("/:id", auth, role("admin"), deleteUser);

export { router as userRouter };
