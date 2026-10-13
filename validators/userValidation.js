const Joi = require("joi");

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(20).trim().required(),

  email: Joi.string().email().lowercase().trim().required(),

  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.",
    }),

  // Optional: Only include if you allow role selection at registration (e.g., in an internal admin panel)
  role: Joi.string().valid("user", "admin").default("user"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),

  password: Joi.string().required(),
});

// Admin-specific validations for user management
const updateUserStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid("user", "admin").required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
};
