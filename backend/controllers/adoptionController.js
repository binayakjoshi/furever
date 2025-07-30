const Adoption = require("../models/adoptionModel")
const HttpError = require("../models/http-error")
const { validationResult } = require("express-validator")

// Create adoption post
exports.createAdoptionPost = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log(errors.array())
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    // userID check garya yeta
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const { name, description, breed, location, contactInfo, requirements ,petType} = req.body
    
    // Normalize petType to lowercase
    const normalizedPetType = petType ? petType.toLowerCase() : 'dog'
    
    const adoptionPost = new Adoption({
    
      creator: req.userData.userId,
      name,
      description,
      breed,
      image:{
        url:req.file.path,
        publicId:req.file.filename,
      },
      location,
      contactInfo: contactInfo || "",
      requirements: requirements || "",
      petType: normalizedPetType,
      status: "active", 
    })

    //adoption save garna
    await adoptionPost.save()

    await adoptionPost.populate([
  { path: "creator", select: "name email phone" },
  { path: "image", select: "url publicId" },
])

    res.status(201).json({
      success: true,
      message: "Adoption post created successfully",
      data: adoptionPost,
    })
  } catch (error) {
    console.error("Create adoption post error:", error)
    if (error instanceof HttpError) {
      return res.status(error.code).json({
        success: false,
        message: error.message,
      })
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create adoption post",
    })
  }
}


exports.getAdoptionPosts = async (req, res) => {
  try {
    const { status = "active", location, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query

    const filter = {}
    if (status && status !== "all") {
      filter.status = status
    }
    if (location) {
      filter.location = { $regex: location, $options: "i" }
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

    // Get adoption posts
    const adoptionPosts = await Adoption.find(filter)
      .populate([
        { path: "image", select: "url publicId" },
        { path: "creator", select: "name email phone" },
        { path: "interestedUsers.user", select: "name email" },
      ])
      .sort(sortOptions)
      .skip(skip)
      .limit(Number.parseInt(limit))

    const totalCount = await Adoption.countDocuments(filter)

    res.status(200).json({
      success: true,
      data: adoptionPosts,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalCount / Number.parseInt(limit)),
        totalCount,
        hasNext: skip + adoptionPosts.length < totalCount,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Get adoption posts error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch adoption posts",
    })
  }
}

// Get adoption post by ID
exports.getAdoptionPostById = async (req, res) => {
  try {
    const adoptionPost = await Adoption.findById(req.params.id).populate([
      { path:"image" , select: "url publicId" },
      { path: "creator", select: "name email phone" },
      { path: "interestedUsers.user", select: "name email phone" },
    ])

    if (!adoptionPost) {
      return res.status(404).json({
        success: false,
        message: "Adoption post not found",
      })
    }

    res.status(200).json({
      success: true,
      data: adoptionPost,
    })
  } catch (error) {
    console.error("Get adoption post by ID error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch adoption post",
    })
  }
}

// Get adoption posts by creator
exports.getAdoptionPostsByCreator = async (req, res) => {
  try {
    //same userID check garya yeta 
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }
    
    const creatorId = req.params.creatorId || req.userData.userId
    const { status } = req.query

    const filter = { creator: creatorId }
    if (status && status !== "all") {
      filter.status = status
    }

    const adoptionPosts = await Adoption.find(filter)
      .populate([
        { path: "image", select: "url publicId" },
        { path: "interestedUsers.user", select: "name email" },
      ])
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: adoptionPosts.length,
      data: adoptionPosts,
    })
  } catch (error) {
    console.error("Get adoption posts by creator error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch adoption posts",
    })
  }
}

// Delete adoption post
exports.deleteAdoptionPost = async (req, res) => {
  try {
   
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }
    
    const adoptionPost = await Adoption.findById(req.params.id)

    if (!adoptionPost) {
      return res.status(404).json({
        success: false,
        message: "Adoption post not found",
      })
    }

    
    if (adoptionPost.creator.toString() !== req.userData.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own adoption posts",
      })
    }

    await Adoption.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Adoption post deleted successfully",
    })
  } catch (error) {
    console.error("Delete adoption post error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete adoption post",
    })
  }
}

// Show interest in adoption post
exports.showInterest = async (req, res) => {
  try {
    
    
    
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }
    
    const userId = req.userData.userId
    const adoptionPostId = req.params.id

    const adoptionPost = await Adoption.findById(adoptionPostId)

    if (!adoptionPost) {
      return res.status(404).json({
        success: false,
        message: "Adoption post not found",
      })
    }

    
    if (adoptionPost.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot show interest in inactive adoption posts",
      })
    }

    
    if (adoptionPost.creator.toString() === userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot show interest in your own adoption post",
      })
    }

  
    const alreadyInterested = adoptionPost.interestedUsers.some((interest) => interest.user.toString() === userId)

    if (alreadyInterested) {
      return res.status(409).json({
        success: false,
        message: "You have already shown interest in this adoption post",
      })
    }

    // Add user to interested users array
    adoptionPost.interestedUsers.push({
      user: userId,
    })

    await adoptionPost.save()

   
    await adoptionPost.populate([
      { path: "image", select: "url publicId" },
      { path: "creator", select: "name email" },
      { path: "interestedUsers.user", select: "name email" },
    ])

    res.status(200).json({
      success: true,
      message: "Interest recorded successfully",
      data: {
        adoptionPost: adoptionPost,
        interestedUsersCount: adoptionPost.interestedUsers.length,
      },
    })
  } catch (error) {
    console.error("Show interest error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to record interest",
    })
  }
}

// Remove interest from adoption post
exports.removeInterest = async (req, res) => {
  try {
  
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }
    
    const userId = req.userData.userId
    const adoptionPostId = req.params.id

    const adoptionPost = await Adoption.findById(adoptionPostId)

    if (!adoptionPost) {
      return res.status(404).json({
        success: false,
        message: "Adoption post not found",
      })
    }

    // Check if user has shown interest
    const interestIndex = adoptionPost.interestedUsers.findIndex((interest) => interest.user.toString() === userId)

    if (interestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "You have not shown interest in this adoption post",
      })
    }

    // Remove user from interested users array
    adoptionPost.interestedUsers.splice(interestIndex, 1)
    await adoptionPost.save()

    res.status(200).json({
      success: true,
      message: "Interest removed successfully",
      data: {
        interestedUsersCount: adoptionPost.interestedUsers.length,
      },
    })
  } catch (error) {
    console.error("Remove interest error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to remove interest",
    })
  }
}

// Get interested users for a specific adoption post (only for creator)
exports.getInterestedUsers = async (req, res) => {
  try {
   
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }
    
    const adoptionPostId = req.params.id
    const userId = req.userData.userId

    const adoptionPost = await Adoption.findById(adoptionPostId).populate({
      path: "interestedUsers.user",
      select: "name email phone",
    })

    if (!adoptionPost) {
      return res.status(404).json({
        success: false,
        message: "Adoption post not found",
      })
    }

    // Only creator can view interested users
    if (adoptionPost.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only view interested users for your own adoption posts",
      })
    }

    res.status(200).json({
      success: true,
      data: {
        adoptionPostId: adoptionPost._id,
        petName: adoptionPost.name,
        interestedUsers: adoptionPost.interestedUsers,
        totalInterested: adoptionPost.interestedUsers.length,
      },
    })
  } catch (error) {
    console.error("Get interested users error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch interested users",
    })
  }
}

//update the post
exports.updateAdoptionPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

   
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const adoptionPostId = req.params.id;
    const userId = req.userData.userId;
    const { name, description, breed, location, contactInfo, requirements, status, image, petType } = req.body;

   
    const adoptionPost = await Adoption.findById(adoptionPostId);
    if (!adoptionPost) {
      return res.status(404).json({
        success: false,
        message: "Adoption post not found",
      });
    }

    
    if (adoptionPost.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own adoption posts",
      });
    }

   
    if (adoptionPost.status === "adopted") {
      return res.status(400).json({
        success: false,
        message: "Cannot update an already adopted pet post",
      });
    }

    
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (breed !== undefined) updateData.breed = breed;
    if (location !== undefined) updateData.location = location;
    if (contactInfo !== undefined) updateData.contactInfo = contactInfo;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (petType !== undefined) updateData.petType = petType.toLowerCase();
    
    
    if (image !== undefined) {
      
      if (image && typeof image === 'object' && image.url && image.publicId) {
        updateData.image = {
          url: image.url,
          publicId: image.publicId
        };
      } else if (image === null || image === '') {
        
        return res.status(400).json({
          success: false,
          message: "Image is required. Please provide a valid image with url and publicId",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid image format. Image must contain url and publicId",
        });
      }
    }
    
    
    if (status !== undefined) {
      const allowedStatusUpdates = ["active", "pending", "cancelled"];
      if (allowedStatusUpdates.includes(status)) {
        updateData.status = status;
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid status update. Allowed values: active, pending, cancelled",
        });
      }
    }

  
    const updatedAdoptionPost = await Adoption.findByIdAndUpdate(
      adoptionPostId,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate([
      { path: "image", select: "url publicId" },
      { path: "creator", select: "name email phone" },
      { path: "interestedUsers.user", select: "name email" },
    ]);

    res.status(200).json({
      success: true,
      message: "Adoption post updated successfully",
      data: updatedAdoptionPost,
    });

  } catch (error) {
    console.error("Update adoption post error:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    if (error instanceof HttpError) {
      return res.status(error.code).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update adoption post",
    });
  }
};


exports.getAvailableAdoptionPosts = async (req, res) => {
  try {
    const { status = "active", location, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query
    
    
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }
    
    const userId = req.userData.userId

    const filter = {
      creator: { $ne: userId } 
    }
    
    if (status && status !== "all") {
      filter.status = status
    }
    if (location) {
      filter.location = { $regex: location, $options: "i" }
    }

    // Parse and validate pagination parameters
    const pageNum = Math.max(1, Number.parseInt(page) || 1)
    const limitNum = Math.min(50, Math.max(1, Number.parseInt(limit) || 10)) // Cap at 50 items per page
    const skip = (pageNum - 1) * limitNum
    
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

    
    const adoptionPosts = await Adoption.find(filter)
      .populate([
        { path: "image", select: "url publicId" },
        { path: "creator", select: "name email phone" },
        { path: "interestedUsers.user", select: "name email" },
      ])
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)

    const totalCount = await Adoption.countDocuments(filter)

    res.status(200).json({
      success: true,
      data: adoptionPosts,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        hasNext: skip + adoptionPosts.length < totalCount,
        hasPrev: pageNum > 1,
      },
    })
  } catch (error) {
    console.error("Get available adoption posts error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch available adoption posts",
    })
  }
}