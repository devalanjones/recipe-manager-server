const express = require("express");
const {
  getAllUsers,
  toggleUserStatus,
  deleteUser,
} = require("../controllers/userController");
const { updateUserStatusSchema } = require("../validators/userValidation");
const validate = require("../middlewares/validate");
const { tokenValidation, isAdmin } = require("../middlewares/tokenValidation");

const adminRouter = express.Router();

adminRouter.use(tokenValidation, isAdmin);

adminRouter.get("/users", getAllUsers);

adminRouter.patch(
  "/users/:id/status",
  validate(updateUserStatusSchema),
  toggleUserStatus,
);

adminRouter.delete("/users/:id", deleteUser);

module.exports = adminRouter;
