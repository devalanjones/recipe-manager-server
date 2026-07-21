const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");
let Recipe = require("../models/recipeModel");

// CREATE
let createRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.create({
      ...req.body,
      userId: req.user.id,
      imgUrl: req.file.path,
      imgPublicId: req.file.filename,
    });

    // await recipe.save();

    res.status(201).json({
      success: true,
      message: "recipe created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL
const getAllRecipe = async (req, res) => {
  try {
    const recipes = await Recipe.find({
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET BY ID
const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    let { userId } = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipe ID",
      });
    }

    const recipe = await Recipe.findById(id, userId);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    res.status(200).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
let updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    let userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipe ID",
      });
    }

    // Find recipe first
    const recipe = await Recipe.findOne({ _id: id, userId });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    const updateData = { ...req.body };

    if (req.file) {
      // Delete old image
      if (recipe.imgPublicId) {
        await cloudinary.uploader.destroy(recipe.imgPublicId);
      }

      // Save new image
      updateData.imgUrl = req.file.path;
      updateData.imgPublicId = req.file.filename;
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      message: "Recipe updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE
const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    let userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipe ID",
      });
    }

    // Find the recipe owned by the current user
    const recipe = await Recipe.findOne({ _id: id, userId });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    // Delete image from Cloudinary
    if (recipe.imgPublicId) {
      await cloudinary.uploader.destroy(recipe.imgPublicId);
    }

    // Delete recipe from MongoDB
    await Recipe.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Recipe deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createRecipe,
  getAllRecipe,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
};
