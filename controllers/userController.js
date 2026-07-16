let User = require("../models/userModel");
let bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");

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

    let user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

let loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPassword = await bcrypt.compare(req.body.password, user.password);

    if (!isPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = { registerUser, loginUser };
