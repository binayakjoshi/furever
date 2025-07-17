const express = require("express")
const { authenticate } = require("../middleware/authentication")
const appointmentController = require("../controllers/appointmentController")
const { 
  createAppointmentValidation, 
  updateAppointmentValidation, 
  cancelAppointmentValidation
} = require("../middleware/appointmentValidation")

const router = express.Router()

// Public routes
router.get("/", appointmentController.getAppointments)

// All other routes require authentication
router.use(authenticate)

// User appointment routes
router.get("/my-appointments", appointmentController.getUserAppointments)
router.get("/user/:userId", appointmentController.getUserAppointments)

// Veterinarian appointment routes - to see who wants appointments with them
router.get("/vet/:veterinarianId", appointmentController.getVeterinarianAppointments)
router.get("/vet/my-requests", appointmentController.getVeterinarianAppointments)

// Create appointment request
router.post("/", createAppointmentValidation, appointmentController.createAppointment)

// Specific appointment routes - /:id should be at the end
router.get("/:id", appointmentController.getAppointmentById)
router.put("/:id", updateAppointmentValidation, appointmentController.updateAppointment)
router.delete("/:id", appointmentController.deleteAppointment)
router.patch("/:id/cancel", cancelAppointmentValidation, appointmentController.cancelAppointment)

module.exports = router
