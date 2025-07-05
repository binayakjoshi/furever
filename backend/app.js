const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const cookieParser = require("cookie-parser")
require("dotenv").config()

const petRoutes = require("./routes/petRoutes")
const userRoutes = require("./routes/userRoutes")
const adoptionRoutes = require("./routes/adoptionRoutes")
const vetRoutes = require("./routes/vetRoutes") // Fixed vet routes
const HttpError = require("./models/http-error")

const app = express()
const PORT = process.env.PORT || 5000

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    credentials: true,
  }),
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get("/", (req, res) => {
  res.json({
    message: "Pet Information API with JWT Authentication",
    contact: {
      phone: "9860909077",
      support: "For API support and inquiries"
    },
    endpoints: {
      auth: {
        signup: "POST /api/users/signup",
        login: "POST /api/users/login",
        logout: "POST /api/users/logout",
        me: "GET /api/users/me",
      },
      pets: "/api/pets",
      users: "/api/users",
      adoptions: {
        base: "/api/adoptions",
        create: "POST /api/adoptions",
        getAll: "GET /api/adoptions",
        getById: "GET /api/adoptions/:id",
        update: "PUT /api/adoptions/:id",
        delete: "DELETE /api/adoptions/:id",
        showInterest: "POST /api/adoptions/:id/interest",
        removeInterest: "DELETE /api/adoptions/:id/interest",
        getInterestedUsers: "GET /api/adoptions/:id/interested-users",
        myPosts: "GET /api/adoptions/my-posts",
      },
      veterinarians: {
        base: "/api/vets",
        createProfile: "POST /api/vets/profile",
        getAll: "GET /api/vets",
        getById: "GET /api/vets/:id",
        getMyProfile: "GET /api/vets/my-profile",
        updateProfile: "PUT /api/vets/profile",
        deleteProfile: "DELETE /api/vets/profile",
        getBySpecialization: "GET /api/vets/specialization/:specialization",
        searchByLocation: "GET /api/vets/search/location",
        contact: "POST /api/vets/:id/contact",
        updateStatus: "PATCH /api/vets/:id/status",
      },
    },
  })
})

app.use("/api/pets", petRoutes)
app.use("/api/users", userRoutes)
app.use("/api/adoptions", adoptionRoutes)
app.use("/api/vets", vetRoutes)

app.use((req, res, next) => {
  const error = new HttpError(`Route ${req.originalUrl} not found`, 404)
  next(error)
})

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error)
  }
  console.error("Error:", error.message)
  res.status(error.code || 500).json({
    success: false,
    message: error.message || "An unknown error occurred!",
  })
})

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB Atlas")
    app.listen(PORT, () => {
      console.log(`Server is running on: http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
  })
