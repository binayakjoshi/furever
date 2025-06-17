const express = require("express")
const router = express.Router()
const petController = require("../controllers/petController")

// CRUD routes
router.post("/", petController.createPet)
router.get("/", petController.getAllPets)
router.get("/user/:userId", petController.getAllPets) //get all petss assoicated with a user with passing userid in the URL
router.get("/:id", petController.getPetById)
router.put("/:id", petController.updatePet)
router.delete("/:id", petController.deletePet)

module.exports = router
