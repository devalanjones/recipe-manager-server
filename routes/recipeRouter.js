let express = require("express");
const {
  createRecipe,
  getAllRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipeById,
} = require("../controllers/recipeController");
const upload = require("../config/multerConfig");
const validate = require("../middlewares/validate");
const recipeValidationSchema = require("../validators/recipeValidation");
const parseRecipeFormData = require("../middlewares/parsingRecipeFormData");
let recipeRouter = express.Router();

recipeRouter.post(
  "/",
  upload.single("image"),
  parseRecipeFormData,
  validate(recipeValidationSchema),
  createRecipe,
);
recipeRouter.get("/", getAllRecipe);
recipeRouter.get("/:id", getRecipeById);
recipeRouter.put(
  "/:id",
  upload.single("image"),
  parseRecipeFormData,
  validate(recipeValidationSchema),
  updateRecipe,
);
recipeRouter.delete("/:id", deleteRecipe);

module.exports = recipeRouter;
