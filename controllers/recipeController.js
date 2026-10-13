const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");
const Recipe = require("../models/recipeModel");

// Helper to check user ownership or admin override (for edit/delete only)
const getOwnershipQuery = (recipeId, user) => {
  const query = { _id: recipeId };
  if (user.role !== "admin") {
    query.userId = user.id;
  }
  return query;
};

// GET PUBLIC / ALL USERS' RECIPES (Explore feed)
const getPublicRecipes = async (req, res) => {
  try {
    const { search, page = 1, limit = 9 } = req.query;

    const query = {};
    // Only add search filter if it contains non-whitespace text
    if (search && search.trim() !== "") {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { cuisine: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 9);
    const skip = (pageNum - 1) * limitNum;

    const [recipes, total] = await Promise.all([
      Recipe.find(query)
        .populate("userId", "username email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Recipe.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: recipes.length,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE
const createRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.create({
      ...req.body,
      userId: req.user.id,
      imgUrl: req.file ? req.file.path : null,
      imgPublicId: req.file ? req.file.filename : null,
    });

    res.status(201).json({
      success: true,
      message: "Recipe created successfully",
      data: recipe,
    });
  } catch (error) {
    if (req.file?.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (err) {
        console.error("Cloudinary cleanup failed:", err.message);
      }
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET MY RECIPES (Admins see all; regular users see only their own)
const getAllRecipe = async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { userId: req.user.id };
    const recipes = await Recipe.find(query).sort({ createdAt: -1 });

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

// GET BY ID (Allows any user to view any recipe detail)
const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipe ID",
      });
    }

    const recipe = await Recipe.findById(id).populate(
      "userId",
      "username email",
    );

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

// UPDATE (Restricted to owner or admin)
const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipe ID",
      });
    }

    const query = getOwnershipQuery(id, req.user);
    const recipe = await Recipe.findOne(query);

    if (!recipe) {
      if (req.file?.filename) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(404).json({
        success: false,
        message: "Recipe not found or unauthorized",
      });
    }

    const updateData = { ...req.body };

    if (req.file) {
      if (recipe.imgPublicId) {
        try {
          await cloudinary.uploader.destroy(recipe.imgPublicId);
        } catch (err) {
          console.error("Cloudinary delete failed:", err.message);
        }
      }

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
      data: updatedRecipe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE (Restricted to owner or admin)
const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipe ID",
      });
    }

    const query = getOwnershipQuery(id, req.user);
    const recipe = await Recipe.findOne(query);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found or unauthorized",
      });
    }

    if (recipe.imgPublicId) {
      try {
        await cloudinary.uploader.destroy(recipe.imgPublicId);
      } catch (err) {
        console.error("Cloudinary delete failed:", err.message);
      }
    }

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
  getPublicRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
};
