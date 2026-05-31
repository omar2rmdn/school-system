import type { Request, Response } from "express";
import { News } from "./model";
import { createNewsSchema, updateNewsSchema } from "./validation";

async function getAllNews(req: Request, res: Response) {
  const news = await News.find().sort({ createdAt: -1 }).select("-__v");
  return res.status(200).json({
    message: "news sent successfully",
    data: { news },
  });
}

async function getOneNews(req: Request, res: Response) {
  const { id } = req.params;
  const newsItem = await News.findById(id).select("-__v");
  if (!newsItem) {
    return res.status(404).json({ message: "News not found" });
  }
  return res.status(200).json({
    message: "news sent successfully",
    data: { news: newsItem },
  });
}

async function addNews(req: Request, res: Response) {
  const { error } = createNewsSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const newsItem = new News(req.body);
  await newsItem.save();

  return res.status(201).json({
    message: "news created successfully",
    data: { news: newsItem.toObject() },
  });
}

async function editNews(req: Request, res: Response) {
  const { error } = updateNewsSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const { id } = req.params;
  const newsItem = await News.findById(id);
  if (!newsItem) {
    return res.status(404).json({ message: "News not found" });
  }

  const updatedNews = await News.findByIdAndUpdate(id, req.body, {
    new: true,
  }).select("-__v");

  return res.status(200).json({
    message: "news updated successfully",
    data: { news: updatedNews },
  });
}

async function deleteNews(req: Request, res: Response) {
  const { id } = req.params;
  const newsItem = await News.findByIdAndDelete(id);
  if (!newsItem) {
    return res.status(404).json({ message: "News not found" });
  }
  return res.status(200).json({ message: "news deleted successfully" });
}

export { getAllNews, getOneNews, addNews, editNews, deleteNews };