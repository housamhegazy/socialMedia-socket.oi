const express = require("express");
const router = express.Router();
const CommentModel = require("../Models/comment.js");
const { AuthMiddleware } = require("../Middleware/AuthMiddleware.js");
const PostModel = require("../Models/Post.js");
const NotificationSchema = require("../Models/notifications.js");
// const { userSockets } = require("../index.js");
require("dotenv").config();
const {
  addComment,
  getComments,
  addReply,
  deleteComment,
  deleteReply,
} = require("../comntrollers/comment.js");

// add comment
router.post("/:postId", AuthMiddleware, addComment);

// لجلب كل التعليقات على البوست سواء كانت من المستخدم ام من مستخدمين اخرين
router.get("/getComments/:postId", AuthMiddleware, getComments);
//add replies to comment
router.post("/replay/:commentId", AuthMiddleware, addReply);
// delete one comment
router.delete("/:commentId", AuthMiddleware, deleteComment);
//delete replay
router.delete("/replay/:commentId/:replayId", AuthMiddleware, deleteReply);

module.exports = router;
