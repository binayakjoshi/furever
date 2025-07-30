const express = require("express")
const router = express.Router()
const vaccinationController = require("../controllers/vaccinationController")
const { authenticate } = require("../middleware/authentication")

router.use(authenticate)

router.get("/upcoming", vaccinationController.getUpcomingVaccinations)

router.post("/trigger-reminders", vaccinationController.triggerReminders)

router.get("/stats", vaccinationController.getVaccinationStats)

module.exports = router
