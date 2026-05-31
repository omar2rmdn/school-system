import mongoose from "mongoose";

interface IActivity {
  title: string;
  description: string;
}

const activitySchema = new mongoose.Schema<IActivity>({
  title: { type: String, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

const Activity = mongoose.model("Activity", activitySchema);

export { Activity };
