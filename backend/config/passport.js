// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback" // Updated to match your redirect URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth Profile:', profile);
    
    // Check if user already exists with this Google ID
    let existingUser = await User.findOne({ googleId: profile.id });
    
    if (existingUser) {
      console.log('Existing Google user found:', existingUser.email);
      return done(null, existingUser);
    }

    // Check if user exists with same email
    existingUser = await User.findOne({ email: profile.emails[0].value });
    
    if (existingUser) {
      // Link Google account to existing user
      console.log('Linking Google account to existing user:', existingUser.email);
      existingUser.googleId = profile.id;
      if (profile.photos && profile.photos[0]) {
        existingUser.profileImage = {
          url: profile.photos[0].value,
          publicId: 'google_' + profile.id
        };
      }
      await existingUser.save();
      return done(null, existingUser);
    }

    // Create new user
    console.log('Creating new Google user:', profile.emails[0].value);
    const newUser = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      profileImage: {
        url: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
        publicId: 'google_' + profile.id
      },
      role: 'user',
      // Generate a random password for OAuth users (they won't use it)
      password: await bcrypt.hash(Math.random().toString(36) + Date.now().toString(), 12)
    });

    await newUser.save();
    console.log('New Google user created:', newUser.email);
    done(null, newUser);
  } catch (error) {
    console.error('Google OAuth Strategy Error:', error);
    done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;