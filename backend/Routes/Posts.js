const express = require("express");
const router = express.Router();
const { AuthMiddleware } = require("../Middleware/AuthMiddleware.js");
const {uploadPost,
  getAllPosts,
  getOnePost,
  getPostsForUser,
  editPost,
  deletePost,
  deleteAllPosts,
  likeUnlikePost} = require("../comntrollers/post.js");
const {
  upload,
} = require("../Utils/cloudinary.js");

require("dotenv").config();

router.post("/", AuthMiddleware, upload.single("image"), uploadPost);

//get all posts for all users
router.get("/", AuthMiddleware, getAllPosts);
//get one post 
router.get("/:postId", AuthMiddleware, getOnePost);

//get posts for one user
router.get("/user/:userId", AuthMiddleware, getPostsForUser);
//===================================== edit post ===========================================
router.put(
  "/:postId",
  AuthMiddleware,
  upload.single("image"),
  editPost
);
//===================================== delete post ===========================================

router.delete("/:postId", AuthMiddleware, deletePost);
//========================= delete all posts =============================================
router.delete("/", AuthMiddleware, deleteAllPosts);

// ================= LIKE / UNLIKE POST =================
router.put("/like/:postId", AuthMiddleware, likeUnlikePost);

module.exports = router;
