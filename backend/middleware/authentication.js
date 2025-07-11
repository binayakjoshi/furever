const jwt = require("jsonwebtoken")
const HttpError = require("../models/http-error")

const authenticate = (req, res, next) => {
  try {
    const token = req.cookies.token
    if (!token) {
      return next(new HttpError("Please login or create account to visit this route", 401))
    }
    let decodedToken
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return next(new HttpError("Invalid or expired token, please login again", 401))
    }
    req.userData = {
      userId: decodedToken.userId,
      email: decodedToken.email,
      role: decodedToken.role || "pet-owner",
    }
    next()
  } catch (error) {
    return next(new HttpError("Authentication failed", 401))
  }
}

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.userData) {
      return next(new HttpError("Authentication required", 401))
    }

    if (!allowedRoles.includes(req.userData.role)) {
      return next(new HttpError("Access denied. Insufficient permissions.", 403))
    }

    next()
  }
}

module.exports = authenticate
module.exports.requireRole = requireRole
