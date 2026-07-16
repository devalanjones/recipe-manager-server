let Joi = require("joi");

let registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(20).required(),

  email: Joi.string().email().required(),

  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.",
    }),
});

let loginSchema = Joi.object({
  email: Joi.string().email().required(),

  password: Joi.string().required(),
});


module.exports = { registerSchema, loginSchema }