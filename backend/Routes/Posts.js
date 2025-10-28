const express = require("express");
const router = express.Router();
const PostModel = require("../Models/Post.js");
const { AuthMiddleware } = require("../Middleware/AuthMiddleware.js");
const cloudinary = require("../Utils/cloudinary.js");
require("dotenv").config();

router.post("/", AuthMiddleware, async (req, res) => {
  try {
    const { image, text } = req.body;
    // upload image to cloudinary
    let imageURl = null;
    //  التحقق: يجب أن يكون هناك نص أو صورة على الأقل
    if (!image && !text) {
      return res
        .status(400)
        .json({ message: "Post must contain either text or an image." });
    }
    if (image) {
      const result = await cloudinary.uploader.upload(image, {
        folder: "socialmediaApp/posts",
      });
      //get image url from cloudinary
      imageURl = result.secure_url;
    }
    // upload all data to mongoo db
    const newPost = new PostModel({
      owner: req.user.id,
      text,
      image: imageURl,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", AuthMiddleware, async (req, res) => {
  try {
    const posts = await PostModel.find()
      .populate("owner", "name email avatar") // populate : لجلب بيانات المالك (اليوزر) لكل بوست
      .populate("likes") //الهدف: استبدال كل ID داخل مصفوفة الإعجابات بالبيانات الكاملة للمستخدمين الذين قاموا بالإعجاب.
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:postId", AuthMiddleware, async (req, res) => {
  const postId = req.params.postId;
  try {
    const post = await PostModel.findById(postId);
    if (post.owner.toString() !== req.user.id) {
      // التحقق من ان البوست ينتمي للمالك
      return res.status(403).json({ error: "Not Autherized" });
    }
    //update image in cloudinary if there is new image
    if (req.body.image && req.body.image !== post.image) {
      //upload new image to cloudinary
      const result = await cloudinary.uploader.upload(req.body.image, {
        folder: "socialmediaApp/posts",
      });
      post.image = result.secure_url;
    }
    // تعديل النص ولو المستخدم اتراجع عن التعديل رجعلي النص الاصلي
    post.text = req.body.text || post.text;
    // post.image = req.body.image || post.image
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:postId", AuthMiddleware, async (req, res) => {
  const postId = req.params.postId;
  try {
    const post = await PostModel.findOne({ _id: postId, owner: req.user.id });
    if (post) {
      //delete image from cloudinary
      if (post.image) {
        const publicId = post.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`socialmediaApp/posts/${publicId}`);
      }
    } else {
      return res.status(404).json({ message: "post not found" });
    }
    //delete post from mongodb
    await PostModel.findOneAndDelete({ _id: postId, owner: req.user.id });
    res.status(200).json({ message: "post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/", AuthMiddleware, async (req, res) => {
  try {
    const posts = await PostModel.find({ owner: req.user.id });
    if (posts.length > 0) {
      const deletionPromises = posts.map(async (post) => {
        if (post.image) {
          const publicId = post.image.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`socialmediaApp/posts/${publicId}`);
        }
      });
      await Promise.all(deletionPromises);
    }
    await PostModel.deleteMany({ owner: req.user.id });
    res.status(200).json({ message: "posts deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
