const express = require("express")
const { authenticate } = require("../middleware/authentication")
const appointmentController = require("../controllers/appointmentController")
const { 
  expressInterestValidation,
  updateInterestStatusValidation
} = require("../middleware/appointmentValidation")

const router = express.Router()


router.use(authenticate)


router.post("/interest", expressInterestValidation, appointmentController.expressInterest)
router.delete("/interest/:veterinarianId", appointmentController.removeInterest)

router.put("/status", updateInterestStatusValidation, appointmentController.updateInterestStatus)


router.get("/interested-users/:veterinarianId", appointmentController.getInterestedUsers)


router.get("/my-appointments", appointmentController.getUserAppointments)

module.exports = router
