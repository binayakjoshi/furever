const express = require("express")
const { authenticate } = require("../middleware/authentication")
const appointmentController = require("../controllers/appointmentController")
const { 
  
  updateInterestStatusValidation
} = require("../middleware/appointmentValidation")

const router = express.Router()


router.use(authenticate)


router.post("/:vetId/interest", appointmentController.expressInterest)
router.delete("/interest/:veterinarianId", appointmentController.removeInterest)

router.put("/status", updateInterestStatusValidation, appointmentController.updateInterestStatus)


router.get("/interested-users/:veterinarianId", appointmentController.getInterestedUsers)


router.get("/my-appointments", appointmentController.getUserAppointments)

module.exports = router
