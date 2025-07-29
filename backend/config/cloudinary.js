const cloudinary = require("cloudinary").v2
const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Create storage for different folders
const createStorage = (folder = "pets") => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      transformation: [{ width: 800, height: 600, crop: "limit" }, { quality: "auto" }, { fetch_format: "auto" }],
    },
  })
}

// Default upload middleware
const upload = multer({
  storage: createStorage("pets"),
})

const uploadImage = async (image) => {
  const imageData = await image.arrayBuffer()
  const mime = image.type
  const encoding = "base64"
  const base64Data = Buffer.from(imageData).toString("base64")
  const fileUri = "data:" + mime + ";" + encoding + "," + base64Data
  const result = await cloudinary.uploader.upload(fileUri, {
    folder: "pets",
  })
  return result.secure_url
}

const uploadToFolder = async (image, folder = "pets") => {
  try {
    const imageData = await image.arrayBuffer()
    const mime = image.type
    const encoding = "base64"
    const base64Data = Buffer.from(imageData).toString("base64")
    const fileUri = "data:" + mime + ";" + encoding + "," + base64Data
    const result = await cloudinary.uploader.upload(fileUri, {
      folder: folder,
      transformation: [{ width: 800, height: 600, crop: "limit" }, { quality: "auto" }, { fetch_format: "auto" }],
    })
    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error.message)
    throw new Error("Failed to upload image to Cloudinary")
  }
}

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    if (result.result !== "ok") {
      console.warn("Cloudinary delete warning:", result)
    }
    return result
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error.message)
    throw new Error("Failed to delete image from Cloudinary")
  }
}

module.exports = {
  cloudinary,
  upload,
  createStorage,
  uploadImage,
  uploadToFolder,
  deleteFromCloudinary,
}
