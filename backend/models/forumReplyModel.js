const mongoose = require("mongoose")

const forumReplySchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Reply content is required"],
    trim: true,
    maxlength: [3000, "Reply content cannot exceed 3000 characters"],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ForumPost",
    required: true,
  },
  parentReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ForumReply",
    default: null, // null for top-level replies, set for nested replies
  },

  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      likedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  status: {
    type: String,
    enum: ["active", "hidden", "deleted"],
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

// Indexes for better query performance
forumReplySchema.index({ post: 1 })
forumReplySchema.index({ author: 1 })
forumReplySchema.index({ parentReply: 1 })
forumReplySchema.index({ status: 1 })
forumReplySchema.index({ createdAt: -1 })

// Update the updatedAt field before saving
forumReplySchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

const ForumReply = mongoose.model("ForumReply", forumReplySchema)
module.exports = ForumReply
