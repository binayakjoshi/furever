const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const User = require("../models/userModel")
const bcrypt = require("bcryptjs")

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google OAuth Profile:", profile.displayName, profile.emails[0].value)

        let existingUser = await User.findOne({ googleId: profile.id })
        if (existingUser) {
           //existing user ko role user vayeko le oauth ma prooblem aayo
          if (existingUser.role !== "pet-owner") {
            console.log("Updating role for existing user:", existingUser.email, "to pet-owner")
            existingUser.role = "pet-owner"
          }
          console.log("Existing Google user found:", existingUser.email)
          if (profile.photos && profile.photos[0]) {
            existingUser.profileImage = {
              url: profile.photos[0].value,
              publicId: "google_" + profile.id,
            }
          }
          // Add default location if missing
          if (!existingUser.location || !existingUser.location.coordinates) {
            existingUser.location = {
              type: "Point",
              coordinates: [0, 0]
            }
          }
          await existingUser.save() 
          return done(null, existingUser)
        }

        existingUser = await User.findOne({ email: profile.emails[0].value })
        if (existingUser) {
           
          if (existingUser.role !== "pet-owner") {
            console.log("Updating role for existing user:", existingUser.email, "to pet-owner")
            existingUser.role = "pet-owner"
          }
          console.log("Linking Google account to existing user:", existingUser.email)
          existingUser.googleId = profile.id
          if (profile.photos && profile.photos[0]) {
            existingUser.profileImage = {
              url: profile.photos[0].value,
              publicId: "google_" + profile.id,
            }
          }
          await existingUser.save()
          return done(null, existingUser)
        }

        console.log("Creating new Google user:", profile.emails[0].value)
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profileImage: {
            url: profile.photos && profile.photos[0] ? profile.photos[0].value : "",
            publicId: "google_" + profile.id,
          },
          role: "pet-owner",
        })

        await newUser.save()
        console.log("New Google user created successfully:", newUser.email, "with role:", newUser.role)
        done(null, newUser)
      } catch (error) {
        console.error("Google OAuth Strategy Error:", error)
        done(error, null)
      }
    },
  ),
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-password")
    done(null, user)
  } catch (error) {
    console.error("Deserialize user error:", error)
    done(error, null)
  }
})

module.exports = passport
