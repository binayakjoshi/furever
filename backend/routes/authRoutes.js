// routes/authRoutes.js
const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

const sendTokenCookie = (res, payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "6h" });
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 6 * 60 * 60 * 1000, // 6 hours
  };
  res.cookie("token", token, cookieOptions);
  return token;
};

// Start Google OAuth flow
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/auth/error`
  }),
  (req, res) => {
    try {
      console.log('Google OAuth callback successful for user:', req.user.email);
      
      // Create JWT token
      const payload = { 
        userId: req.user._id, 
        email: req.user.email 
      };
      
      sendTokenCookie(res, payload);
      
      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL}/auth/success?user=${encodeURIComponent(JSON.stringify({
        userId: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profileImage: req.user.profileImage
      }))}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
    }
  }
);

// Check OAuth status (optional - for debugging)
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'OAuth routes are working',
    callbackUrl: 'http://localhost:5000/auth/google/callback'
  });
});

module.exports = router;