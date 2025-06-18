const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary")
const Pet = require("../models/petModel")
const User = require("../models/userModel")
const cloudinary = require("../config/cloudinary")

// Upload pet image
exports.uploadPetImage = async (req, res) => {
  try {
    const { petId } = req.params
    const { image } = req.body // base64 string

    
    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image data is required",
      })
    }

    if (!petId) {
      return res.status(400).json({
        success: false,
        message: "Pet ID is required",
      })
    }

    //pet exits or not
    const pet = await Pet.findById(petId)
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      })
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(image, "furever/pets")

    // Update pet 
    const updatedPet = await Pet.findByIdAndUpdate(
      petId,
      {
        image: {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
        },
      },
      { new: true },
    )

    res.status(200).json({
      success: true,
      message: "Pet image uploaded successfully",
      data: {
        pet: updatedPet,
        imageInfo: uploadResult,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Upload multiple pet images
exports.uploadPetImages = async (req, res) => {
  try {
    const { petId } = req.params
    const { images } = req.body // Array of base64 strings

    // Validate
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Images array is required",
      })
    }

    if (images.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 images allowed",
      })
    }

    //  pet exists
    const pet = await Pet.findById(petId)
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      })
    }

    // Upload all images to Cloudinary
    const uploadPromises = images.map((image) => uploadToCloudinary(image, "furever/pets"))
    const uploadResults = await Promise.all(uploadPromises)

    // Prepare image objects for database
    const imageObjects = uploadResults.map((result) => ({
      url: result.url,
      publicId: result.publicId,
    }))

    // append the images
    const existingImages = pet.images || []
    const updatedPet = await Pet.findByIdAndUpdate(
      petId,
      {
        images: [...existingImages, ...imageObjects],
      },
      { new: true },
    )

    res.status(200).json({
      success: true,
      message: `${uploadResults.length} images uploaded successfully`,
      data: {
        pet: updatedPet,
        uploadedImages: uploadResults,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete pet image
exports.deletePetImage = async (req, res) => {
  try {
    const { petId } = req.params

    const pet = await Pet.findById(petId)
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      })
    }

    if (!pet.image || !pet.image.publicId) {
      return res.status(400).json({
        success: false,
        message: "No image to delete",
      })
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(pet.image.publicId)

    // Remove image from database
    const updatedPet = await Pet.findByIdAndUpdate(petId, { $unset: { image: 1 } }, { new: true })

    res.status(200).json({
      success: true,
      message: "Pet image deleted successfully",
      data: updatedPet,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// //  user profile image
// exports.uploadUserImage = async (req, res) => {
//   try {
//     const { userId } = req.params
//     const { image } = req.body // Base64 string

    
//     if (!image) {
//       return res.status(400).json({
//         success: false,
//         message: "Image data is required",
//       })
//     }

    
//     const user = await User.findById(userId)
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       })
//     }

    
//     const uploadResult = await uploadToCloudinary(image, "furever/users")

//     // Update user with new profile image
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         profileImage: {
//           url: uploadResult.url,
//           publicId: uploadResult.publicId,
//         },
//       },
//       { new: true },
//     )

//     res.status(200).json({
//       success: true,
//       message: "Profile image uploaded successfully",
//       data: {
//         user: updatedUser,
//         imageInfo: uploadResult,
//       },
//     })
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     })
//   }
// }

// // Delete user profile image
// exports.deleteUserImage = async (req, res) => {
//   try {
//     const { userId } = req.params

//     const user = await User.findById(userId)
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       })
//     }

//     if (!user.profileImage || !user.profileImage.publicId) {
//       return res.status(400).json({
//         success: false,
//         message: "No profile image to delete",
//       })
//     }

//     // Delete from Cloudinary
//     await deleteFromCloudinary(user.profileImage.publicId)

//     // Remove image from database
//     const updatedUser = await User.findByIdAndUpdate(userId, { $unset: { profileImage: 1 } }, { new: true })

//     res.status(200).json({
//       success: true,
//       message: "Profile image deleted successfully",
//       data: updatedUser,
//     })
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     })
//   }
// }

// Get image upload status/info
exports.getImageInfo = async (req, res) => {
  try {
    const { publicId } = req.params

    // Get image info from Cloudinary
    const result = await cloudinary.api.resource(publicId)

    res.status(200).json({
      success: true,
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes,
        createdAt: result.created_at,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
