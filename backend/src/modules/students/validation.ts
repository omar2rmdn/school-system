import Joi from "joi";

const studentSchema = Joi.object({
  firstName: Joi.string().trim().max(50).required().messages({
    "string.empty": "First name is required",
    "string.max": "First name cannot exceed 50 characters",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().trim().max(50).required().messages({
    "string.empty": "Last name is required",
    "string.max": "Last name cannot exceed 50 characters",
    "any.required": "Last name is required",
  }),
  class: Joi.string().required().messages({
    "string.empty": "Class is required",
    "any.required": "Class is required",
  }),
  parentPhone: Joi.string().trim().required().messages({
    "string.empty": "Parent phone is required",
    "any.required": "Parent phone is required",
  }),
});

const studentUpdateSchema = Joi.object({
  firstName: Joi.string().trim().max(50).messages({
    "string.max": "First name cannot exceed 50 characters",
  }),
  lastName: Joi.string().trim().max(50).messages({
    "string.max": "Last name cannot exceed 50 characters",
  }),
  class: Joi.string().messages({
    "string.empty": "Class is required",
  }),
  parentPhone: Joi.string().trim().messages({
    "string.empty": "Parent phone is required",
  }),
}).min(1);

export { studentSchema, studentUpdateSchema };