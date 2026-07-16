let Joi = require("joi");

let recipeValidationSchema = Joi.object({
  recipeName: Joi.string().trim().min(2).max(100).required(),

  isVeg: Joi.boolean().required(),

  description: Joi.string().allow("", null),

  cookingTime: Joi.number().integer().min(1),

  ingredients: Joi.array().items(Joi.string().trim()).min(1),

  instructions: Joi.array().items(Joi.string().trim()).min(1),

  imgUrl: Joi.string().uri().allow("", null),

  userId: Joi.string().hex().length(24),
});

module.exports = recipeValidationSchema;
