import Joi from "joi";

const createActivitySchema = Joi.object({
  title: Joi.string().required().min(3).max(200),
  description: Joi.string().required(),
});

const updateActivitySchema = Joi.object({
  title: Joi.string().min(3).max(200),
  description: Joi.string(),
}).min(1);

export { createActivitySchema, updateActivitySchema };
