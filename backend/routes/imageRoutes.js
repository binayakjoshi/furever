const express = require("express")
const router = express.Router()
const imageController = require("../controllers/imageController")

// General image routes
router.get("/info/:publicId", imageController.getImageInfo)

module.exports = router
