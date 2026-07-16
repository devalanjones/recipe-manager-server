let express = require("express");
let cors = require("cors");
let path = require("path");
let dotenv = require("dotenv");

dotenv.config();

let app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

let mongodbConnect = require("./config/dbconfig");
mongodbConnect();

let userRouter = require("./routes/userRouter");
let recipeRouter = require("./routes/recipeRouter");
const tokenValidation = require("./middlewares/tokenValidation");

app.use("/images", express.static(path.join(__dirname, "/images")));

app.use("/user", userRouter);
app.use("/recipes", tokenValidation, recipeRouter);



app.get("/", (req, res) => {
  res.send("API Running");
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log("Server is connected");
});
