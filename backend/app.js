const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const petRoutes = require("./routes/petRoutes")

const userRoutes=require("./routes/userRoutes")

const imageRoutes=require("./routes/imageRoutes")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    credentials: true,
  }),
)

// Increase payload limit for base64 images
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))
app.use(express.json())


mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err))

app.use("/api/pets", petRoutes)
app.use("/api/users", userRoutes)
app.use("/api/images", imageRoutes)


app.get("/", (req, res) => {
  res.json({
    message: "Pet Information API with Cloudinary Integration",
    endpoints: {
      pets: "/api/pets",
      users: "/api/users",
      images: "/api/images",
    },
  })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong!",
  })
})



app.get("/", (req, res) => {
  res.send("Server is running")
})


app.listen(PORT, () => {
  console.log(`Server is running on : http://localhost:${PORT}`)
})
