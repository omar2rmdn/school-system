import mongoose from "mongoose";

interface INews {
  title: string;
  content: string;
}

const newsSchema = new mongoose.Schema<INews>({
  title: { type: String, required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const News = mongoose.model("News", newsSchema);

export { News };
