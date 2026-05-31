import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRouter } from "./modules/users/route";
import { subjectRouter } from "./modules/subjects/route";
import { classRouter } from "./modules/classes/route";
import { studentRouter } from "./modules/students/route";
import { eventRouter } from "./modules/events/route";
import { attendanceRouter } from "./modules/attendance/route";
import { complaintRouter } from "./modules/complaints/route";
import { finalGradeRouter } from "./modules/final-grades/route";
import { errorMiddleware } from "./middleware/error";
import { bootstrap } from "./config/server";
import { timetableRouter } from "./modules/timetables/route";

const app = express();
export default app;

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/users", userRouter);
app.use("/api/subjects", subjectRouter);
app.use("/api/classes", classRouter);
app.use("/api/students", studentRouter);
app.use("/api/events", eventRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/complaints", complaintRouter);
app.use("/api/final-grades", finalGradeRouter);
app.use("/api/timetables", timetableRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Error handling middleware
app.use(errorMiddleware);

bootstrap(app);
