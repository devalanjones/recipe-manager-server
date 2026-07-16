let express = require("express");
const { loginUser, registerUser } = require("../controllers/userController");
const { loginSchema, registerSchema } = require("../validators/userValidation");
const validate = require("../middlewares/validate");
let userRouter = express.Router();

userRouter.post("/login", validate(loginSchema), loginUser);
userRouter.post("/register", validate(registerSchema), registerUser);

module.exports = userRouter;
