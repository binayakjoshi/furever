const mongoose = require("mongoose")

const forumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Post title is required"],
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"],
  },
  content: {
    type: String,
    required: [true, "Post content is required"],
    trim: true,
    maxlength: [5000, "Content cannot exceed 5000 characters"],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: String,
    enum: ["general", "pet-care", "adoption", "veterinary", "training", "nutrition", "emergency"],
    default: "general",
    required: true,
  },

  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumReply",
    },
  ],
  status: {
    type: String,
    enum: ["active", "deleted"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})


forumPostSchema.index({ author: 1 })
forumPostSchema.index({ category: 1 })
forumPostSchema.index({ status: 1 })
forumPostSchema.index({ createdAt: -1 })
forumPostSchema.index({ isPinned: -1, createdAt: -1 })


forumPostSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

const ForumPost = mongoose.model("ForumPost", forumPostSchema)
module.exports = ForumPost
