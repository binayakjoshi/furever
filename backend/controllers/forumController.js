const ForumPost = require("../models/forumPostModel")
const ForumReply = require("../models/forumReplyModel")
const User = require("../models/userModel")
const { validationResult } = require("express-validator")
const { deleteFromCloudinary } = require("../config/cloudinary")
const mongoose = require("mongoose")


const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id)
}

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

    const { title, content, category } = req.body
    const userId = req.userData.userId

    const forumPost = new ForumPost({
      title,
      content,
      author: userId,
      category: category || "general",
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

      //author lai saddhai ID validate garnu parcha
      
      if (!isValidObjectId(author)) {
        return res.status(400).json({
          success: false,
          message: "Invalid author ID format",
        })
      }
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

    // reply count ko lagi
    const postsWithStats = await Promise.all(
      forumPosts.map(async (post) => {
        const postObj = post.toObject()
        
        //latest reply count 
        postObj.replyCount = await ForumReply.countDocuments({ 
          post: post._id, 
          status: "active" 
        })
        postObj.latestReply = post.replies.length > 0 ? post.replies[0] : null
        return postObj
      })
    )

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


const getForumPostById = async (req, res) => {
  try {
    const postId = req.params.id

    
    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      })
    }

    const forumPost = await ForumPost.findById(postId)
      .populate("author", "name profileImage role createdAt")
      .populate({
        path: "replies",
        match: { status: "active" },
        populate: {
          path: "author",
          select: "name profileImage role",
        },
        options: { sort: { createdAt: 1 } }, // Old reply paila dekhaucha sort garda
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

    
    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      })
    }

    const forumPost = await ForumPost.findById(postId)

    if (!forumPost) {
      return res.status(404).json({
        success: false,
        message: "Forum post not found",
      })
    }

    
    if (forumPost.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own posts",
      })
    }

    
    if (title?.trim()) forumPost.title = title.trim()
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


const deleteForumPost = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.userData.userId

    
    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      })
    }

    const forumPost = await ForumPost.findById(postId)

    if (!forumPost) {
      return res.status(404).json({
        success: false,
        message: "Forum post not found",
      })
    }

    // author le matra delete garna milcha afno post
    if (forumPost.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      })
    }

    // Delete all replies
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

    
    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      })
    }

   
    if (parentReply && !isValidObjectId(parentReply)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parent reply ID format",
      })
    }

    // Check if parentReply exist
    if (parentReply) {
      const parentReplyExists = await ForumReply.findById(parentReply)
      if (!parentReplyExists) {
        return res.status(404).json({
          success: false,
          message: "Parent reply not found",
        })
      }
    }

    
    const forumPost = await ForumPost.findById(postId)
    if (!forumPost) {
      return res.status(404).json({
        success: false,
        message: "Forum post not found",
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

    // Only add to post's replies array if it's a top-level reply (no parentReply)
    // The middleware will handle adding to parent reply's replies array if needed
    if (!parentReply) {
      forumPost.replies.push(forumReply._id)
      await forumPost.save()
    }

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


const getForumReplies = async (req, res) => {
  try {
    const postId = req.params.id
    const { page = 1, limit = 20 } = req.query

    
    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      })
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const replies = await ForumReply.find({ post: postId, status: "active" })
      .populate("author", "name profileImage role")
      .populate("parentReply", "content author")
      .sort({ createdAt: 1 }) // old first
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

    
    if (!isValidObjectId(replyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reply ID format",
      })
    }

    const forumReply = await ForumReply.findById(replyId)

    if (!forumReply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      })
    }

    // author gareko manche le matra reply update garna milcha
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


const deleteForumReply = async (req, res) => {
  try {
    const replyId = req.params.replyId
    const userId = req.userData.userId

   
    if (!isValidObjectId(replyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reply ID format",
      })
    }

    const forumReply = await ForumReply.findById(replyId)

    if (!forumReply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      })
    }

  
    if (forumReply.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own replies",
      })
    }

   
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
  createForumReply,
  getForumReplies,
  updateForumReply,
  deleteForumReply,
  getUserForumPosts,
}
