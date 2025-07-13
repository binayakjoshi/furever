const ForumPost = require("../models/forumPostModel")
const ForumReply = require("../models/forumReplyModel")
const User = require("../models/userModel")
const { validationResult } = require("express-validator")
const { deleteFromCloudinary } = require("../config/cloudinary")

// Create a new forum post
const createForumPost = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { title, content, category, tags } = req.body
    const userId = req.userData.userId

   

    const forumPost = new ForumPost({
      title,
      content,
      author: userId,
      category: category || "general",
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      
    })

    await forumPost.save()
    await forumPost.populate("author", "name profileImage role")

    res.status(201).json({
      success: true,
      message: "Forum post created successfully",
      data: forumPost,
    })
  } catch (error) {
    console.error("Create forum post error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create forum post",
    })
  }
}

// Get all forum posts with pagination and filtering
const getForumPosts = async (req, res) => {
  try {
    const { category, author, search, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query

    // filter
    const filter = { status: "active" }
    if (category && category !== "all") {
      filter.category = category
    }
    if (author) {
      filter.author = author
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
       
      ]
    }

    // Pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

    // Special sorting for pinned posts
    if (sortBy === "createdAt") {
      sortOptions.isPinned = -1 // Pinned posts first
    }

    const forumPosts = await ForumPost.find(filter)
      .populate("author", "name profileImage role")
      .populate({
        path: "replies",
        select: "author createdAt",
        populate: {
          path: "author",
          select: "name profileImage",
        },
        options: { limit: 3, sort: { createdAt: -1 } }, //3 ta reply matra dekhaune
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(Number.parseInt(limit))

    const totalCount = await ForumPost.countDocuments(filter)

    // Add reply count
    const postsWithStats = forumPosts.map((post) => {
      const postObj = post.toObject()
      postObj.replyCount = post.replies.length
      postObj.latestReply = post.replies.length > 0 ? post.replies[0] : null
      return postObj
    })

    res.status(200).json({
      success: true,
      data: postsWithStats,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalCount / Number.parseInt(limit)),
        totalCount,
        hasNext: skip + forumPosts.length < totalCount,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Get forum posts error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch forum posts",
    })
  }
}

// Get a single forum post with all replies
const getForumPostById = async (req, res) => {
  try {
    const postId = req.params.id

    // Increment view count
    await ForumPost.findByIdAndUpdate(postId, { $inc: { views: 1 } })

    const forumPost = await ForumPost.findById(postId)
      .populate("author", "name profileImage role createdAt")
      .populate({
        path: "replies",
        match: { status: "active" },
        populate: {
          path: "author",
          select: "name profileImage role",
        },
        options: { sort: { createdAt: 1 } }, // Oldest replies first
      })

    if (!forumPost || forumPost.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Forum post not found",
      })
    }

    res.status(200).json({
      success: true,
      data: forumPost,
    })
  } catch (error) {
    console.error("Get forum post by ID error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch forum post",
    })
  }
}

// Update forum post
const updateForumPost = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const postId = req.params.id
    const userId = req.userData.userId
    const { title, content, category } = req.body

    const forumPost = await ForumPost.findById(postId)

    if (!forumPost) {
      return res.status(404).json({
        success: false,
        message: "Forum post not found",
      })
    }

    // Only author can update the post
    if (forumPost.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own posts",
      })
    }

    // Update fields
    if (title) forumPost.title = title
    if (content) forumPost.content = content
    if (category) forumPost.category = category
  

  
    await forumPost.save()
    await forumPost.populate("author", "name profileImage role")

    res.status(200).json({
      success: true,
      message: "Forum post updated successfully",
      data: forumPost,
    })
  } catch (error) {
    console.error("Update forum post error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update forum post",
    })
  }
}

// Delete forum post
const deleteForumPost = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.userData.userId

    const forumPost = await ForumPost.findById(postId)

    if (!forumPost) {
      return res.status(404).json({
        success: false,
        message: "Forum post not found",
      })
    }

    // Only author can delete the post
    if (forumPost.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      })
    }

    // Delete all replies to this post
    await ForumReply.deleteMany({ post: postId })

    await ForumPost.findByIdAndDelete(postId)

    res.status(200).json({
      success: true,
      message: "Forum post and all replies deleted successfully",
    })
  } catch (error) {
    console.error("Delete forum post error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete forum post",
    })
  }
}

// Like/Unlike forum post
const toggleForumPostLike = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.userData.userId

    const forumPost = await ForumPost.findById(postId)

    if (!forumPost) {
      return res.status(404).json({
        success: false,
        message: "Forum post not found",
      })
    }

    // Check if user already liked the post
    const existingLikeIndex = forumPost.likes.findIndex((like) => like.user.toString() === userId)

    if (existingLikeIndex > -1) {
      // Unlike the post
      forumPost.likes.splice(existingLikeIndex, 1)
    } else {
      // Like the post
      forumPost.likes.push({ user: userId })
    }

    await forumPost.save()

    res.status(200).json({
      success: true,
      message: existingLikeIndex > -1 ? "Post unliked" : "Post liked",
      data: {
        likesCount: forumPost.likes.length,
        isLiked: existingLikeIndex === -1,
      },
    })
  } catch (error) {
    console.error("Toggle forum post like error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle like",
    })
  }
}

// Create a reply to a forum post
const createForumReply = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const postId = req.params.id
    const { content, parentReply } = req.body
    const userId = req.userData.userId

    // Check if the post exists
    const forumPost = await ForumPost.findById(postId)
    if (!forumPost) {
      return res.status(404).json({
        success: false,
        message: "Forum post not found",
      })
    }

    // Check if post is locked
    if (forumPost.isLocked) {
      return res.status(403).json({
        success: false,
        message: "This post is locked and cannot receive new replies",
      })
    }


    const forumReply = new ForumReply({
      content,
      author: userId,
      post: postId,
      parentReply: parentReply || null,
    })

    await forumReply.save()
    await forumReply.populate("author", "name profileImage role")

    // Add reply to the post's replies array
    forumPost.replies.push(forumReply._id)
    await forumPost.save()

    res.status(201).json({
      success: true,
      message: "Reply created successfully",
      data: forumReply,
    })
  } catch (error) {
    console.error("Create forum reply error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create reply",
    })
  }
}

// Get replies for a specific post
const getForumReplies = async (req, res) => {
  try {
    const postId = req.params.id
    const { page = 1, limit = 20 } = req.query

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const replies = await ForumReply.find({ post: postId, status: "active" })
      .populate("author", "name profileImage role")
      .populate("parentReply", "content author")
      .sort({ createdAt: 1 }) // Oldest first
      .skip(skip)
      .limit(Number.parseInt(limit))

    const totalCount = await ForumReply.countDocuments({ post: postId, status: "active" })

    res.status(200).json({
      success: true,
      data: replies,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalCount / Number.parseInt(limit)),
        totalCount,
        hasNext: skip + replies.length < totalCount,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Get forum replies error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch replies",
    })
  }
}

// Update forum reply
const updateForumReply = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const replyId = req.params.replyId
    const userId = req.userData.userId
    const { content } = req.body

    const forumReply = await ForumReply.findById(replyId)

    if (!forumReply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      })
    }

    // Only author can update the reply
    if (forumReply.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own replies",
      })
    }

    forumReply.content = content
    await forumReply.save()
    await forumReply.populate("author", "name profileImage role")

    res.status(200).json({
      success: true,
      message: "Reply updated successfully",
      data: forumReply,
    })
  } catch (error) {
    console.error("Update forum reply error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update reply",
    })
  }
}

// Delete forum reply
const deleteForumReply = async (req, res) => {
  try {
    const replyId = req.params.replyId
    const userId = req.userData.userId

    const forumReply = await ForumReply.findById(replyId)

    if (!forumReply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      })
    }

    // Only author can delete the reply
    if (forumReply.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own replies",
      })
    }

    // Remove reply from post's replies array
    await ForumPost.findByIdAndUpdate(forumReply.post, {
      $pull: { replies: replyId },
    })



    await ForumReply.findByIdAndDelete(replyId)

    res.status(200).json({
      success: true,
      message: "Reply deleted successfully",
    })
  } catch (error) {
    console.error("Delete forum reply error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete reply",
    })
  }
}

// Like/Unlike forum reply
const toggleForumReplyLike = async (req, res) => {
  try {
    const replyId = req.params.replyId
    const userId = req.userData.userId

    const forumReply = await ForumReply.findById(replyId)

    if (!forumReply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      })
    }

    // Check if user already liked the reply
    const existingLikeIndex = forumReply.likes.findIndex((like) => like.user.toString() === userId)

    if (existingLikeIndex > -1) {
      // Unlike the reply
      forumReply.likes.splice(existingLikeIndex, 1)
    } else {
      // Like the reply
      forumReply.likes.push({ user: userId })
    }

    await forumReply.save()

    res.status(200).json({
      success: true,
      message: existingLikeIndex > -1 ? "Reply unliked" : "Reply liked",
      data: {
        likesCount: forumReply.likes.length,
        isLiked: existingLikeIndex === -1,
      },
    })
  } catch (error) {
    console.error("Toggle forum reply like error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle like",
    })
  }
}

// Get user's forum posts
const getUserForumPosts = async (req, res) => {
  try {
    const userId = req.userData.userId
    const { page = 1, limit = 10 } = req.query

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const forumPosts = await ForumPost.find({ author: userId, status: "active" })
      .populate("author", "name profileImage role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const totalCount = await ForumPost.countDocuments({ author: userId, status: "active" })

    res.status(200).json({
      success: true,
      data: forumPosts,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalCount / Number.parseInt(limit)),
        totalCount,
        hasNext: skip + forumPosts.length < totalCount,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Get user forum posts error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user forum posts",
    })
  }
}

module.exports = {
  createForumPost,
  getForumPosts,
  getForumPostById,
  updateForumPost,
  deleteForumPost,
  toggleForumPostLike,
  createForumReply,
  getForumReplies,
  updateForumReply,
  deleteForumReply,
  toggleForumReplyLike,
  getUserForumPosts,
}
