let multer = require("multer");
let {CloudinaryStorage} = require("multer-storage-cloudinary")
let cloudinary = require("./cloudinary")

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "recipe_uploads",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

module.exports = upload;


// let path = require("path");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "./images");
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = Date.now() + path.extname(file.originalname);
//     cb(null, uniqueName);
//   },
// });