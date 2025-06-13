const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const petRoutes = require("./routes/petRoutes")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())


mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err))


app.use("/api/pets", petRoutes)


app.get("/", (req, res) => {
  res.send("Server is running")
})


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
