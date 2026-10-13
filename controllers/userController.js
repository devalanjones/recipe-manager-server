let User = require("../models/userModel");
let Recipe = require("../models/recipeModel");
let bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");

// ================= USER AUTH ================= //

let registerUser = async (req, res) => {
  try {
    let { username, email, password } = req.body;

    let existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    let hashedPassword = await bcrypt.hash(password, 10);

    // Hardcode role: "user" to prevent privilege escalation via req.body
    let user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "user",
      isActive: true,
    });

    res.status(201).json({
      message: "User created successfully",
      success: true,
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

let loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Block deactivated or banned accounts
    if (user.isActive === false) {
      return res.status(403).json({
        message: "Your account has been deactivated. Contact an administrator.",
      });
    }

    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Embed role so downstream auth middlewares can inspect req.user.role
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ================= ADMIN CONTROLLERS ================= //

// GET /api/admin/users
// GET /api/admin/users?page=1&limit=10&search=john&role=user&isActive=true
let getAllUsers = async (req, res) => {
  try {
    // 1. Sanitize pagination parameters
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10),
    ); // Cap limit to 100
    const skip = (page - 1) * limit;

    // 2. Build filter query
    const query = {};

    // Search username or email (case-insensitive substring match)
    if (req.query.search && req.query.search.trim()) {
      const sanitizedSearch = req.query.search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(sanitizedSearch, "i");

      query.$or = [{ username: searchRegex }, { email: searchRegex }];
    }

    // Optional filters for admin convenience
    if (req.query.role) {
      query.role = req.query.role;
    }
    if (typeof req.query.isActive !== "undefined") {
      query.isActive = req.query.isActive === "true";
    }

    // 3. Execute query and count in parallel
    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    // 4. Return paginated response
    res.status(200).json({
      users,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/users/:id/status
let toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Prevent admin from locking their own account
    if (id === req.user.id) {
      return res.status(400).json({
        message: "You cannot deactivate your own admin account",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `User status changed to ${isActive ? "active" : "inactive"}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/users/:id
let deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting their own account
    if (id === req.user.id) {
      return res.status(400).json({
        message: "You cannot delete your own admin account",
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cascade delete any recipes owned by this user
    await Recipe.deleteMany({ userId: id });

    res.status(200).json({
      message: "User and their recipes removed successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
};
