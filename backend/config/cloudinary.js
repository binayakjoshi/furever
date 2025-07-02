const cloudinary = require("cloudinary").v2


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})


const uploadImage = async (image) => {
  const imageData = await image.arrayBuffer();
  const mime = image.type;
  const encoding = "base64";
  const base64Data = Buffer.from(imageData).toString("base64");
  const fileUri = "data:" + mime + ";" + encoding + "," + base64Data;
  const result = await cloudinary.uploader.upload(fileUri, {
    folder: "pets",
  });
  return result.secure_url;
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {     
console.error("Error deleting image from Cloudinary:", error.message);
    throw new Error("Failed to delete image from Cloudinary");
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteFromCloudinary,     
};
// module.exports = { cloudinary, uploadImage }