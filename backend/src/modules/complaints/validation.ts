import Joi from "joi";

const createComplaintSchema = Joi.object({
  studentId: Joi.string().required().messages({
    "string.empty": "Student ID is required",
    "any.required": "Student ID is required",
  }),
  title: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title cannot exceed 100 characters",
    "any.required": "Title is required",
  }),
  description: Joi.string().min(10).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 10 characters",
    "any.required": "Description is required",
  }),
});

export { createComplaintSchema };
