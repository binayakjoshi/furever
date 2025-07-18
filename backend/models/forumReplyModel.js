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
    default: null, //nested reply ko lagi 
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


forumReplySchema.index({ post: 1 })
forumReplySchema.index({ author: 1 })
forumReplySchema.index({ parentReply: 1 })
forumReplySchema.index({ status: 1 })
forumReplySchema.index({ createdAt: -1 })


forumReplySchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

// Middleware to maintain bidirectional relationships
forumReplySchema.post("save", async function (doc) {
  // If this reply has a parent reply, add this reply to parent's replies array
  if (doc.parentReply) {
    await mongoose.model("ForumReply").findByIdAndUpdate(
      doc.parentReply,
      { $addToSet: { replies: doc._id } }
    )
  }
  
  // Add this reply to the post's replies array (if it's a top-level reply)
  if (!doc.parentReply) {
    await mongoose.model("ForumPost").findByIdAndUpdate(
      doc.post,
      { $addToSet: { replies: doc._id } }
    )
  }
})

// Middleware to clean up relationships when a reply is deleted
forumReplySchema.pre("findOneAndDelete", async function () {
  const doc = await this.model.findOne(this.getQuery())
  if (doc) {
    // Remove from parent reply's replies array
    if (doc.parentReply) {
      await mongoose.model("ForumReply").findByIdAndUpdate(
        doc.parentReply,
        { $pull: { replies: doc._id } }
      )
    }
    
    // Remove from post's replies array (if it's a top-level reply)
    if (!doc.parentReply) {
      await mongoose.model("ForumPost").findByIdAndUpdate(
        doc.post,
        { $pull: { replies: doc._id } }
      )
    }
  }
})

const ForumReply = mongoose.model("ForumReply", forumReplySchema)
module.exports = ForumReply
