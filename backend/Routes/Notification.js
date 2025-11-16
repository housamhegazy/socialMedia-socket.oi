const express = require("express");
const router = express.Router();
const NotificationSchema = require("../Models/notifications.js")
const { AuthMiddleware } = require("../Middleware/AuthMiddleware.js");

router.get("/",AuthMiddleware, async (req,res)=>{
  try{
    const notification = await NotificationSchema.find({recipient:req.user.id})
    .populate("sender","name avatar")
    .populate("post","text")
    .sort({createdAt:-1})
    res.json(notification)
  }catch(error){
    res.status(500).json({error:error.message})
  }
})

router.get("/unread-count",AuthMiddleware, async (req,res)=>{
  try{
    const count = await NotificationSchema.countDocuments({
      recipient:req.user.id,
      isRead:false
    })
    res.json({count})
  }catch(error){
    res.status(500).json({error:error.message})
  }
})
module.exports = router;