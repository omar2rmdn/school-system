import express from "express";

export const errorMiddleware = (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  console.error(err.stack);

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate field value" });
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
