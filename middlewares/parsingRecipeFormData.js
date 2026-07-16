let parseRecipeFormData = (req, res, next) => {
  if (req.body.ingredients) {
    req.body.ingredients = JSON.parse(req.body.ingredients);
  }

  if (req.body.instructions) {
    req.body.instructions = JSON.parse(req.body.instructions);
  }

  next();
};

module.exports = parseRecipeFormData;
