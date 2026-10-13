const express = require("express");
const {
  createRecipe,
  getAllRecipe,
  getPublicRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
} = require("../controllers/recipeController");
const upload = require("../config/multerConfig");
const validate = require("../middlewares/validate");
const recipeValidationSchema = require("../validators/recipeValidation");
const parseRecipeFormData = require("../middlewares/parsingRecipeFormData");

const recipeRouter = express.Router();

// User-specific list (dashboard)
recipeRouter.get("/", getAllRecipe);
// Public / All-users feed (MUST be defined before /:id)
recipeRouter.get("/explore", getPublicRecipes);


// Single recipe view
recipeRouter.get("/:id", getRecipeById);

// Create recipe
recipeRouter.post(
  "/",
  upload.single("image"),
  parseRecipeFormData,
  validate(recipeValidationSchema),
  createRecipe,
);

// Update recipe
recipeRouter.put(
  "/:id",
  upload.single("image"),
  parseRecipeFormData,
  validate(recipeValidationSchema),
  updateRecipe,
);

// Delete recipe
recipeRouter.delete("/:id", deleteRecipe);

module.exports = recipeRouter;
