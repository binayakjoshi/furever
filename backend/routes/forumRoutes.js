const express = require("express")
const router = express.Router()
const forumController = require("../controllers/forumController")
const { authenticate } = require("../middleware/authentication")
const imageUpload = require("../middleware/imageUpload")
const { body } = require("express-validator")


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


const forumReplyValidation = [
  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 1, max: 3000 })
    .withMessage("Content must be between 1 and 3000 characters"),
]


router.get("/", forumController.getForumPosts)


router.use(authenticate)

// add garde hai maile post garne route
router.post("/", forumPostValidation, forumController.createForumPost)

// fixed , moved to starting 
router.get("/user/my-posts", forumController.getUserForumPosts)


// fixed . moved to starting
router.get("/:id/replies", forumController.getForumReplies)

// reply ko ni reply
router.get("/:id/replies/:replyId/replies", forumController.getReplyReplies)

router.post("/:id/replies", forumReplyValidation, forumController.createForumReply)
router.put("/:id/replies/:replyId", forumReplyValidation, forumController.updateForumReply)
router.delete("/:id/replies/:replyId", forumController.deleteForumReply)


// routing fix
router.get("/:id", forumController.getForumPostById)
router.put("/:id", forumPostValidation, forumController.updateForumPost)
router.delete("/:id", forumController.deleteForumPost)

module.exports = router
