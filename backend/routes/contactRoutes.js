const express = require("express")
const { sendContactMessage } = require("../controllers/contactController")
const { contactFormValidation, handleValidationErrors } = require("../middleware/contactValidation")

const router = express.Router()

router.post("/", contactFormValidation, handleValidationErrors, sendContactMessage)

module.exports = router
