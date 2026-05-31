import type { Express } from "express";
import mongoose from "mongoose";
import { Attendance } from "../modules/attendance/model";

function bootstrap(app: Express) {
  const MONGO_URI = process.env.MONGO_URI;
  const PORT = process.env.PORT;
  if (!MONGO_URI) throw Error("MONGO_URI is not available");

  mongoose
    .connect(MONGO_URI)
    .then(async () => {
      await Attendance.syncIndexes();
      console.log("database connected");
      app.listen(PORT, () => console.log("server started on port:", PORT));
    })
    .catch((error) => console.log("server bootstrap failed", error));
}

export { bootstrap };
