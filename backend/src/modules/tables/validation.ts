import Joi from "joi";

const timeSlotSchema = Joi.object({
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
  subject: Joi.string().allow(null),
});

const daySchema = Joi.object({
  name: Joi.string().required(),
  slots: Joi.array().items(timeSlotSchema),
});

const createTableSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  class: Joi.string().required(),
  days: Joi.array().items(daySchema),
});

const updateTableSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  class: Joi.string(),
  days: Joi.array().items(daySchema),
}).min(1);

export { createTableSchema, updateTableSchema };