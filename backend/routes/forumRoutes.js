const express = require("express")
const router = express.Router()
const forumController = require("../controllers/forumController")
const authenticate = require("../middleware/authentication")
const imageUpload = require("../middleware/imageUpload")
const { body } = require("express-validator")

// Forum post validation
const forumPostValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 10, max: 5000 })
    .withMessage("Content must be between 10 and 5000 characters"),
  body("category")
    .optional()
    .isIn(["general", "pet-care", "adoption", "veterinary", "training", "nutrition", "emergency"])
    .withMessage("Invalid category"),
]

// Forum reply validation
const forumReplyValidation = [
  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 1, max: 3000 })
    .withMessage("Content must be between 1 and 3000 characters"),
]

// Public routes (no authentication required)
router.get("/", forumController.getForumPosts)
router.get("/:id", forumController.getForumPostById)
router.get("/:id/replies", forumController.getForumReplies)

// Protected routes (authentication required)
router.use(authenticate)

// Forum post routes
router.post("/", imageUpload.array("images", 5), forumPostValidation, forumController.createForumPost)
router.put("/:id", imageUpload.array("images", 5), forumPostValidation, forumController.updateForumPost)
router.delete("/:id", forumController.deleteForumPost)
router.post("/:id/like", forumController.toggleForumPostLike)

// Forum reply routes
router.post("/:id/replies", imageUpload.array("images", 3), forumReplyValidation, forumController.createForumReply)
router.put("/:id/replies/:replyId", forumReplyValidation, forumController.updateForumReply)
router.delete("/:id/replies/:replyId", forumController.deleteForumReply)
router.post("/:id/replies/:replyId/like", forumController.toggleForumReplyLike)

// User's forum posts
router.get("/user/my-posts", forumController.getUserForumPosts)

module.exports = router
