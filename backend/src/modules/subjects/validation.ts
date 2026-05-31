import Joi from "joi";

const subjectSchema = Joi.object({
  title: Joi.string().trim().max(100).required().messages({
    "string.empty": "Subject title is required",
    "string.max": "Title cannot exceed 100 characters",
    "any.required": "Subject title is required",
  }),
});

const subjectUpdateSchema = Joi.object({
  title: Joi.string().trim().max(100).messages({
    "string.max": "Title cannot exceed 100 characters",
  }),
}).min(1);

export { subjectSchema, subjectUpdateSchema };