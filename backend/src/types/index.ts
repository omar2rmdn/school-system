import type mongoose from "mongoose";

interface UserData {
  _id: mongoose.Types.ObjectId;
  role: string;
  email: string;
}

export type { UserData };
