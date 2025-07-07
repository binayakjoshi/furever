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
    const { name, email, password, address, phone, dob, role = "user" } = req.body;

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
      dob,
      address,
      phone,
      role,
      profileImage: {
        url: req.file ? req.file.path : '',
        publicId: req.file ? req.file.filename : '',
      }
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

// FIXED: Single login function that handles both regular and OAuth users
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new HttpError("Invalid data passed", 400));
    }
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials, please check your email and password.",
      });
    }

    // Check if this is a Google OAuth user trying to login with password
    if (existingUser.googleId && !password) {
      return res.status(400).json({
        success: false,
        message: "This account is linked with Google. Please use 'Continue with Google' to login.",
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
        profileImage: existingUser.profileImage,
        isGoogleUser: !!existingUser.googleId, // Add this flag
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
      data: { 
        userId: user.id, 
        email: user.email, 
        name: user.name,
        dob: user.dob, 
        role: user.role,
        phone: user.phone,
        address: user.address, 
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        isGoogleUser: !!user.googleId // Add this flag
      },
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

// Update current user's profile (for authenticated users updating their own profile)
exports.updateCurrentUser = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { password, ...updateData } = req.body;

    // Find the user 
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    // Handle profile image update if file is uploaded
    if (req.file) {
      user.profileImage = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    // Update user fields
    if (updateData.name) user.name = updateData.name;
    if (updateData.phone) user.phone = updateData.phone;
    if (updateData.address) user.address = updateData.address;
    if (updateData.dob) user.dob = new Date(updateData.dob);

    // Save the updated user
    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Update current user error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

// Update user password
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if this is a Google OAuth user
    if (user.googleId) {
      return res.status(400).json({
        success: false,
        message: "Cannot change password for Google OAuth accounts",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password and update
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update password",
    });
  }
};

//  for Google OAuth
const createOrUpdateGoogleUser = async (googleProfile) => {
  try {
    // Check if user already exists with this Google ID
    let existingUser = await User.findOne({ googleId: googleProfile.id });
    
    if (existingUser) {
      // Update existing Google user's profile image if needed
      if (googleProfile.photos && googleProfile.photos[0]) {
        existingUser.profileImage = {
          url: googleProfile.photos[0].value,
          publicId: 'google_' + googleProfile.id
        };
        await existingUser.save();
      }
      return existingUser;
    }

    // Check if user exists with same email
    existingUser = await User.findOne({ email: googleProfile.emails[0].value });
    
    if (existingUser) {
      // Link Google account to existing user
      existingUser.googleId = googleProfile.id;
      if (googleProfile.photos && googleProfile.photos[0]) {
        existingUser.profileImage = {
          url: googleProfile.photos[0].value,
          publicId: 'google_' + googleProfile.id
        };
      }
      await existingUser.save();
      return existingUser;
    }

    // Create new user
    const newUser = new User({
      googleId: googleProfile.id,
      name: googleProfile.displayName,
      email: googleProfile.emails[0].value,
      profileImage: {
        url: googleProfile.photos && googleProfile.photos[0] ? googleProfile.photos[0].value : '',
        publicId: 'google_' + googleProfile.id
      },
      role: 'user',
      // Password will be auto-generated by pre-save middleware
    });

    await newUser.save();
    return newUser;
  } catch (error) {
    throw error;
  }
};


exports.createOrUpdateGoogleUser = createOrUpdateGoogleUser;
exports.signup = signup;
exports.login = login;
exports.logout = logout;
exports.getCurrentUser = getCurrentUser;
