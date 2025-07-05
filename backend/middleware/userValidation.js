const { body } = require("express-validator");

const createUserValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .trim(),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .optional()
    .isIn(["user", "vet"])
    .withMessage("Role must be either 'user' or 'vet'"),
  body("dob")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date of birth"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  body("address")
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage("Address must be between 5 and 500 characters")
    .trim(),
];

const updateUserValidation = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .trim(),
  body("dob")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date of birth"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  body("address")
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage("Address must be between 5 and 500 characters")
    .trim(),
];

const updatePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

module.exports = {
  createUserValidation,
  updateUserValidation,
  updatePasswordValidation,
  loginValidation,
};
