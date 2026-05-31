import Joi from "joi";

const classSchema = Joi.object({
  title: Joi.string().trim().max(100).required().messages({
    "string.empty": "Title is required",
    "string.max": "Title cannot exceed 100 characters",
    "any.required": "Title is required",
  }),
});

const classUpdateSchema = Joi.object({
  title: Joi.string().trim().max(100).messages({
    "string.max": "Title cannot exceed 100 characters",
  }),
}).min(1);

export { classSchema, classUpdateSchema };