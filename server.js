const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

// 1. Load environment variables first
dotenv.config();

// 2. Connect to Database
const mongodbConnect = require("./config/dbconfig");
mongodbConnect();

const app = express();

// 3. Core Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Static Files
app.use("/images", express.static(path.join(__dirname, "images")));

// 5. Route Imports
const userRouter = require("./routes/userRouter");
const adminRouter = require("./routes/adminRouter");
const recipeRouter = require("./routes/recipeRouter");
const { tokenValidation } = require("./middlewares/tokenValidation");

// 6. Mount API Routes
app.use("/user", userRouter);
app.use("/admin", adminRouter); // Protection (tokenValidation + isAdmin) is handled inside adminRouter
app.use("/recipes", tokenValidation, recipeRouter);

// 7. Base / Health Check Route
app.get("/", (req, res) => {
  res.status(200).send("API Running");
});

// 8. 404 Route Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// 9. Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// 10. Start Server with Fallback Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});