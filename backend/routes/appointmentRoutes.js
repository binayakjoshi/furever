const express = require("express")
const { authenticate } = require("../middleware/authentication")
const appointmentController = require("../controllers/appointmentController")
const { 
  createAppointmentValidation, 
  updateAppointmentValidation, 
  cancelAppointmentValidation
} = require("../middleware/appointmentValidation")

const router = express.Router()


router.get("/", appointmentController.getAppointments)


router.use(authenticate)



router.get("/my-appointments", appointmentController.getUserAppointments)
router.get("/user/:userId", appointmentController.getUserAppointments)


router.get("/vet/:veterinarianId", appointmentController.getVeterinarianAppointments)
router.get("/vet/my-requests", appointmentController.getVeterinarianAppointments)


router.post("/", createAppointmentValidation, appointmentController.createAppointment)

router.get("/:id", appointmentController.getAppointmentById)
router.put("/:id", updateAppointmentValidation, appointmentController.updateAppointment)
router.delete("/:id", appointmentController.deleteAppointment)
router.patch("/:id/cancel", cancelAppointmentValidation, appointmentController.cancelAppointment)

module.exports = router
