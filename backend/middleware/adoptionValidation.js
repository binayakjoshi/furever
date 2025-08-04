// ...existing code...
const { body } = require("express-validator")

const createAdoptionValidation = [
  body("name")
    .notEmpty()
    .withMessage("Pet name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Pet name must be between 1 and 100 characters"),
  body("description")
    .notEmpty()
    .withMessage("Adoption post description is required")
    .isLength({ min: 20, max: 1000 })
    .withMessage("Description must be between 20 and 1000 characters"),
  body("breed")
    .notEmpty()
    .withMessage("Pet breed is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Breed must be between 1 and 100 characters"),
  body("petType")
    .optional()
    .customSanitizer(value => value ? value.toLowerCase() : value)
    .isIn(["dog", "cat"])
    .withMessage("Pet type must be either dog or cat"),
  body("location")
    .notEmpty()
    .withMessage("Location is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Location must be between 2 and 100 characters"),
  body("requirements")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Requirements cannot exceed 500 characters"),
]

const updateAdoptionValidation = [
  body("name")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Pet name must be between 1 and 100 characters"),
  body("description")
    .optional()
    .isLength({ min: 20, max: 1000 })
    .withMessage("Description must be between 20 and 1000 characters"),
  body("breed")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Breed must be between 1 and 100 characters"),
  body("petType")
    .optional()
    .customSanitizer(value => value ? value.toLowerCase() : value)
    .isIn(["dog", "cat"])
    .withMessage("Pet type must be either dog or cat"),
 
  body("image.url")
    .optional()
    .isURL()
    .withMessage("Invalid image URL"),
  body("image.publicId")
    .optional()
    .isString()
    .withMessage("Image public ID must be a string"),
  
  body("location")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Location must be between 2 and 100 characters"),
  body("requirements")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Requirements cannot exceed 500 characters"),
  body("status")
    .optional()
    .isIn(["active", "pending", "adopted", "cancelled"])
    .withMessage("Status must be active, pending, adopted, or cancelled"),
]


module.exports = {
  createAdoptionValidation,
  updateAdoptionValidation,
}
