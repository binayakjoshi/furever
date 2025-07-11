require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const passport = require("./config/passport")

const petRoutes = require("./routes/petRoutes")
const userRoutes = require("./routes/userRoutes")
const adoptionRoutes = require("./routes/adoptionRoutes")
const vetRoutes = require("./routes/vetRoutes")
const authRoutes = require("./routes/authRoutes")
const forumRoutes = require("./routes/forumRoutes")
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

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)

// Initialize passport
app.use(passport.initialize())
app.use(passport.session())

app.get("/", (req, res) => {
  res.json({
    message: "Pet Information API with JWT Authentication, Location Services & Community Forum",
    contact: {
      phone: "9860909077",
      support: "For API support and inquiries",
    },
    endpoints: {
      auth: {
        signup: "POST /api/users/signup (with role: pet-owner or vet)",
        login: "POST /api/users/login (with role verification)",
        logout: "POST /api/users/logout",
        me: "GET /api/users/me",
        googleLogin: "GET /auth/google",
        googleCallback: "GET /auth/google/callback",
      },
      pets: "/api/pets",
      users: {
        base: "/api/users",
        signup: "POST /api/users/signup",
        login: "POST /api/users/login",
        logout: "POST /api/users/logout",
        me: "GET /api/users/me",
        updateProfile: "PUT /api/users/me",
        updatePassword: "PUT /api/users/me/password",
        updateLocation: "PUT /api/users/location",
        updateLocationByAddress: "PUT /api/users/location/address",
        findNearbyVets: "GET /api/users/nearby-vets?radius=KM&limit=NUMBER",
      },
      adoptions: {
        base: "/api/adoptions",
        create: "POST /api/adoptions",
        getAll: "GET /api/adoptions",
        getAvailable: "GET /api/adoptions/available",
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
        findNearby: "GET /api/vets/nearby?latitude=LAT&longitude=LNG&radius=KM&limit=NUMBER",
        updateLocation: "PUT /api/vets/location",
      },
      forum: {
        base: "/api/forum",
        getPosts: "GET /api/forum",
        createPost: "POST /api/forum",
        getPost: "GET /api/forum/:id",
        updatePost: "PUT /api/forum/:id",
        deletePost: "DELETE /api/forum/:id",
        likePost: "POST /api/forum/:id/like",
        getReplies: "GET /api/forum/:id/replies",
        createReply: "POST /api/forum/:id/replies",
        updateReply: "PUT /api/forum/:id/replies/:replyId",
        deleteReply: "DELETE /api/forum/:id/replies/:replyId",
        likeReply: "POST /api/forum/:id/replies/:replyId/like",
        myPosts: "GET /api/forum/user/my-posts",
      },
    },
    features: {
      authentication: "✅ Role-based login (pet-owner/vet)",
      locationServices: "✅ Enhanced nearby vet search with distance sorting",
      cascadeDelete: "✅ Complete user data cleanup on deletion",
      communityForum: "✅ Posts, replies, likes, and image support",
      adoptionSystem: "✅ Pet adoption with interest tracking",
      veterinarianProfiles: "✅ Professional vet profiles with verification",
    },
    locationServices: {
      status: "✅ Available",
      features: [
        "User location tracking",
        "Veterinarian location tracking",
        "Enhanced nearby vet search with emergency priority",
        "Distance-based sorting",
        "OpenStreetMap integration",
        "Geospatial database queries",
      ],
      supportedCoordinates: "WGS84 (latitude/longitude)",
      maxSearchRadius: "100km",
      geocodingProvider: "OpenStreetMap Nominatim",
    },
  })
})

// Main API routes
app.use("/api/pets", petRoutes)
app.use("/api/users", userRoutes)
app.use("/api/adoptions", adoptionRoutes)
app.use("/api/vets", vetRoutes)
app.use("/api/forum", forumRoutes)
app.use("/auth", authRoutes)

// 404 handler
app.use((req, res, next) => {
  const error = new HttpError(`Route ${req.originalUrl} not found`, 404)
  next(error)
})

// Global error handler
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error)
  }

  console.error("Error:", error.message)

  let statusCode = error.code || error.status || 500
  if (statusCode < 100 || statusCode >= 1000) {
    statusCode = 500
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || "An unknown error occurred!",
  })
})

// Database connection and server startup
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB Atlas")

    const User = require("./models/userModel")
    const Veterinarian = require("./models/vetModel")

    // Ensure geospatial indexes exist
    User.collection
      .createIndex({ location: "2dsphere" }, { background: true })
      .then(() => console.log("User geospatial index ensured"))
      .catch((err) => console.log("User geospatial index warning:", err.message))

    Veterinarian.collection
      .createIndex({ location: "2dsphere" }, { background: true })
      .then(() => console.log("Veterinarian geospatial index ensured"))
      .catch((err) => console.log("Veterinarian geospatial index warning:", err.message))

    app.listen(PORT, () => {
      console.log(`Server is running on: http://localhost:${PORT}`)
      console.log(`Google OAuth URL: http://localhost:${PORT}/auth/google`)
      console.log(`Location services: ENABLED`)
    })
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
  })
