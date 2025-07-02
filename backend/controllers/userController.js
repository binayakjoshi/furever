const User = require("../models/userModel")
const Pet = require("../models/petModel")
const jwt = require("jsonwebtoken")
const HttpError = require("../models/http-error")
const { validationResult } = require("express-validator")
const bcrypt = require("bcryptjs")

const sendTokenCookie = (res, payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "6h" });
  // Set cookie options
  const cookieOptions = {
    httpOnly: true,
    // secure: true in production with HTTPS
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 6 * 60 * 60 * 1000, // 6 hours in ms
    // path: "/" // default
  };
  res.cookie("token", token, cookieOptions);
  return token;
};

const signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new HttpError("Invalid data passed", 400));
    }
    const { name, email, password, role = "user" } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(422).json({
        success: false,
        message: "User exists already, please log in instead",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });
    await newUser.save();

    // Create JWT and set cookie
    const payload = { userId: newUser.id, email: newUser.email };
    sendTokenCookie(res, payload);

    // Respond with user data (no need to send token in body, since cookie is set)
    res.status(201).json({
      success: true,
      message: "User created and logged in successfully",
      data: {
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Creating user failed, please try again.",
    });
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new HttpError("Invalid data passed", 400));
    }
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(403).json({
        success: false,
        message: "User already exists , please login instead.",
      });
    }
    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      return res.status(403).json({
        success: false,
        message: "Invalid password, please recheck and try again.",
      });
    }

    // Create JWT and set cookie
    const payload = { userId: existingUser.id, email: existingUser.email };
    sendTokenCookie(res, payload);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        userId: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Logging in failed, please try again later.",
    });
  }
};

// New: logout clears the cookie
const logout = async (req, res, next) => {
  try {
    // Clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed, please try again.",
    });
  }
};

// New: get current user from req.userData (set by authenticate)
const getCurrentUser = async (req, res, next) => {
  try {
    const { userId } = req.userData;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      data: { userId: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("GetCurrentUser error:", error);
    res.status(500).json({
      success: false,
      message: "Fetching user failed, please try again.",
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const { password, ...updateData } = req.body

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    await Pet.deleteMany({ user: req.params.id })

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.signup = signup
exports.login = login
exports.logout = logout
exports.getCurrentUser= getCurrentUser;
