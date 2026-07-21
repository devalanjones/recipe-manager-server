const mongoose = require("mongoose");
const { type } = require("../validators/recipeValidation");

const recipeSchema = new mongoose.Schema(
  {
    recipeName: {
      type: String,
      required: true,
      trim: true,
    },
    isVeg: {
      type: Boolean,
      required: true,
    },
    description: String,
    cookingTime: Number,
    ingredients: [String],
    instructions: [String],
    imgUrl: {
      type: String,
      default: null,
    },
    imgPublicId: {
      type: String,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("recipe", recipeSchema);
