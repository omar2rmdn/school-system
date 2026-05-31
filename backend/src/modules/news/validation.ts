import Joi from "joi";

const createNewsSchema = Joi.object({
  title: Joi.string().required().min(3).max(200),
  content: Joi.string().required(),
});

const updateNewsSchema = Joi.object({
  title: Joi.string().min(3).max(200),
  content: Joi.string(),
}).min(1);

export { createNewsSchema, updateNewsSchema };
