import Joi from "joi";

const attendanceCreationSchema = Joi.object({
  student: Joi.string().required().messages({
    "string.empty": "Student ID is required",
    "any.required": "Student ID is required",
  }),
  class: Joi.string().required().messages({
    "string.empty": "Class ID is required",
    "any.required": "Class ID is required",
  }),
  subject: Joi.string().required().messages({
    "string.empty": "Subject ID is required",
    "any.required": "Subject ID is required",
  }),
  date: Joi.date().iso().messages({
    "date.base": "Date must be a valid ISO date",
  }),
  status: Joi.string()
    .valid("present", "absent", "late", "excused")
    .required()
    .messages({
      "any.only": "Status must be one of: present, absent, late, excused",
      "string.empty": "Status is required",
      "any.required": "Status is required",
    }),
});

const attendanceUpdateSchema = Joi.object({
  student: Joi.string().messages({
    "string.empty": "Student ID cannot be empty",
  }),
  class: Joi.string().messages({
    "string.empty": "Class ID cannot be empty",
  }),
  subject: Joi.string().messages({
    "string.empty": "Subject ID cannot be empty",
  }),
  date: Joi.date().iso().messages({
    "date.base": "Date must be a valid ISO date",
  }),
  status: Joi.string().valid("present", "absent", "late", "excused").messages({
    "any.only": "Status must be one of: present, absent, late, excused",
  }),
}).min(1);

export { attendanceCreationSchema, attendanceUpdateSchema };
