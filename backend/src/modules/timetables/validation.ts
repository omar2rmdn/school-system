import Joi from "joi";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const daySlotSchema = Joi.object({
  day: Joi.string()
    .valid(...DAYS)
    .required()
    .messages({
      "any.only": "Day must be one of: Sunday, Monday, Tuesday, Wednesday, Thursday",
      "any.required": "Day is required",
    }),
  subject: Joi.string().required().messages({
    "string.empty": "Subject is required",
    "any.required": "Subject is required",
  }),
  startTime: Joi.string().pattern(TIME_REGEX).required().messages({
    "string.pattern.base": "Start time must be in HH:mm format",
    "any.required": "Start time is required",
  }),
  endTime: Joi.string().pattern(TIME_REGEX).required().messages({
    "string.pattern.base": "End time must be in HH:mm format",
    "any.required": "End time is required",
  }),
});

const timetableSchema = Joi.object({
  class: Joi.string().required().messages({
    "string.empty": "Class is required",
    "any.required": "Class is required",
  }),
  days: Joi.array().items(daySlotSchema).min(1).required().messages({
    "array.min": "At least one day slot is required",
    "any.required": "Days are required",
  }),
});

const timetableUpdateSchema = Joi.object({
  class: Joi.string().messages({
    "string.empty": "Class is required",
  }),
  days: Joi.array().items(daySlotSchema).min(1).messages({
    "array.min": "At least one day slot is required",
  }),
}).min(1);

export { timetableSchema, timetableUpdateSchema };
