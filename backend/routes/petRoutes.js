const express = require("express")
const router = express.Router()
const petController = require("../controllers/petController")

// CRUD routes
router.post("/", petController.createPet)
router.get("/", petController.getAllPets)
router.get("/:id", petController.getPetById)
router.put("/:id", petController.updatePet)
router.delete("/:id", petController.deletePet)

module.exports = router
