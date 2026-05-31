import Joi from "joi";

const userRegistrationSchema = Joi.object({
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
  phone: Joi.string()
    .trim()
    .required()
    .pattern(/^\+?[\d\s-()]+$/)
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Please provide a valid phone number",
      "any.required": "Phone number is required",
    }),
  email: Joi.string().trim().lowercase().email().required().messages({
    "string.email": "Please provide a valid email",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
  role: Joi.string()
    .valid("admin", "parent", "teacher", "supervisor")
    .required()
    .messages({
      "any.only": "Role must be one of: admin, parent, teacher, supervisor",
      "string.empty": "Role is required",
      "any.required": "Role is required",
    }),
  classes: Joi.array().items(Joi.string()).messages({
    "array.base": "Classes must be an array of IDs",
  }),
  subjects: Joi.array().items(Joi.string()).messages({
    "array.base": "Subjects must be an array of IDs",
  }),
});

const userLoginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    "string.email": "Please provide a valid email",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});

const userUpdateSchema = Joi.object({
  firstName: Joi.string().trim().max(50).messages({
    "string.max": "First name cannot exceed 50 characters",
  }),
  lastName: Joi.string().trim().max(50).messages({
    "string.max": "Last name cannot exceed 50 characters",
  }),
  phone: Joi.string()
    .trim()
    .pattern(/^\+?[\d\s-()]+$/)
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
    }),
  email: Joi.string().trim().lowercase().email().messages({
    "string.email": "Please provide a valid email",
  }),
  password: Joi.string().min(6).messages({
    "string.min": "Password must be at least 6 characters",
  }),
  role: Joi.string()
    .valid("admin", "parent", "teacher", "supervisor")
    .messages({
      "any.only": "Role must be one of: admin, parent, teacher, supervisor",
    }),
  classes: Joi.array().items(Joi.string()).messages({
    "array.base": "Classes must be an array of IDs",
  }),
  subjects: Joi.array().items(Joi.string()).messages({
    "array.base": "Subjects must be an array of IDs",
  }),
}).min(1);

export { userRegistrationSchema, userLoginSchema, userUpdateSchema };
