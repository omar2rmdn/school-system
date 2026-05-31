import Joi from "joi";

const eventSchema = Joi.object({
  title: Joi.string().trim().max(200).required().messages({
    "string.empty": "Title is required",
    "string.max": "Title cannot exceed 200 characters",
    "any.required": "Title is required",
  }),
  description: Joi.string().trim().max(2000).messages({
    "string.max": "Description cannot exceed 2000 characters",
  }),
});

const eventUpdateSchema = Joi.object({
  title: Joi.string().trim().max(200).messages({
    "string.max": "Title cannot exceed 200 characters",
  }),
  description: Joi.string().trim().max(2000).messages({
    "string.max": "Description cannot exceed 2000 characters",
  }),
}).min(1);

export { eventSchema, eventUpdateSchema };