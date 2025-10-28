const express = require("express");
const router = express.Router();
const User = require("../Models/User.js");
const PostModel = require("../Models/Post.js");
const  {AuthMiddleware}  = require("../Middleware/AuthMiddleware.js");
const cloudinary = require("../Utils/cloudinary.js")
require("dotenv").config();

router.post("/",AuthMiddleware, async (req, res) => {
  try {
    const { image, text } = req.body;
    // upload image to cloudinary
    let imageURl = null;
    // ⭐️ التحقق: يجب أن يكون هناك نص أو صورة على الأقل
    if (!image && !text) {
      return res.status(400).json({ message: "Post must contain either text or an image." });
    }
    if (image) {
      const result = await cloudinary.uploader.upload(image, {
        folder: "socialmediaApp/posts",
        
      });
      //get image url from cloudinary
      imageURl = result.secure_url;
    }
    // upload all data to mongoo db
    const newPost = new PostModel({ owner: req.user.id, text, image: imageURl });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await PostModel.find().populate("owner", "name email avatar").sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
