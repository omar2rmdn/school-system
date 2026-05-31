import Joi from "joi";

const finalGradeSchema = Joi.object({
  student: Joi.string().required().messages({
    "string.empty": "Student is required",
    "any.required": "Student is required",
  }),
  subject: Joi.string().required().messages({
    "string.empty": "Subject is required",
    "any.required": "Subject is required",
  }),
  academicYear: Joi.string().trim().required().messages({
    "string.empty": "Academic year is required",
    "any.required": "Academic year is required",
  }),
  term: Joi.string().trim().valid("first", "second").required().messages({
    "string.empty": "Term is required",
    "any.only": "Term must be either first or second",
    "any.required": "Term is required",
  }),
  score: Joi.number().min(0).max(100).required().messages({
    "number.min": "Score cannot be less than 0",
    "number.max": "Score cannot be greater than 100",
    "any.required": "Score is required",
  }),
});

const finalGradeUpdateSchema = Joi.object({
  academicYear: Joi.string().trim().messages({
    "string.empty": "Academic year is required",
  }),
  term: Joi.string().trim().valid("first", "second").messages({
    "string.empty": "Term is required",
    "any.only": "Term must be either first or second",
  }),
  score: Joi.number().min(0).max(100).messages({
    "number.min": "Score cannot be less than 0",
    "number.max": "Score cannot be greater than 100",
  }),
  grade: Joi.string().trim().messages({
    "string.empty": "Grade is required",
  }),
}).min(1);

export { finalGradeSchema, finalGradeUpdateSchema };
