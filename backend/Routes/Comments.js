const express = require("express");
const router = express.Router();
const CommentModel = require("../Models/comment.js");
const { AuthMiddleware } = require("../Middleware/AuthMiddleware.js");
const PostModel = require("../Models/Post.js");
const NotificationSchema = require("../Models/notifications.js")
// const { userSockets } = require("../index.js");
require("dotenv").config();

// add comment 
router.post("/:postId", AuthMiddleware, async (req, res) => {
  try {
    const newPost = await PostModel.findById(req.params.postId);
     if (!newPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    const { text } = req.body;
    
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Text is required" });
    }
    const comment = new CommentModel({
      text,
      owner: req.user.id,
      post: req.params.postId,
    });
    if (!comment) {
      return res.status(401).json({ message: "no comment" });
    }
    await comment.save();
    const populated = await comment.populate("owner", "name email avatar");

    //==============================web socket ============================
    //Get post to find post owner
    // create notification if commenter not post owner
    if(newPost.owner.toString() !== req.user.id){
      const notification = new NotificationSchema({
        recipient:newPost.owner,
        sender:req.user.id,
        type:"comment",
        post:req.params.postId,
        comment:comment._id
      })

      await notification.save()
      const populatedNotification = await notification.populate("sender","name avatar")
      //send realtime notification
      const io = req.app.get("io")
      const userSockets = req.app.get("userSockets");
      const recipientSocketId = userSockets.get(newPost.owner.toString());
      if(recipientSocketId){
        io.to(recipientSocketId).emit("receiveNotification",populatedNotification)
      }
    }
    //======================= end socket ==============================================
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// لجلب كل التعليقات على البوست سواء كانت من المستخدم ام من مستخدمين اخرين
router.get("/getComments/:postId", AuthMiddleware, async (req, res) => {
  const postId = req.params.postId
  try {
    const comments = await CommentModel.find({ post: postId })
      .populate("owner", "name email avatar username") // استبدال اي دي مالك البوست باسمه وصورته وايميله
      .populate("replies.owner", "name avatar username")
      .sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//add replies to comment
router.post("/replay/:commentId", AuthMiddleware, async (req, res) => {
  try {
    const { replyText } = req.body;
    //من الأفضل التأكد من أن المستخدم قد أرسل نصًا فعليًا في الرد.
    if (!replyText || replyText.trim() === "") {
      return res.status(400).json({ message: "Reply text is required." });
    }

    const updatedComment = await CommentModel.findByIdAndUpdate(
      req.params.commentId,
      {
        $push: {
          replies: { owner: req.user.id, text:replyText },
        },
      },
      { new: true } // لجعل الدالة ترجع المستند بعد التحديث
    );
    // 3. التحقق الأمني من وجود التعليق
    if (!updatedComment) {
      return res
        .status(404)
        .json({ message: "Comment not found to reply to." });
    }
    const populated = await updatedComment.populate("replies.owner","name avatar")
        //==============================web socket ============================
    //Get comment to find comment owner
    const comment = await CommentModel.findById(req.params.commentId)
    // create notification if commenter not post owner
    if(comment.owner.toString() !== req.user.id){
      const notification = new NotificationSchema({
        recipient:comment.owner,
        sender:req.user.id,
        type:"reply",
        post:comment.post,
        comment:comment._id
      })

      await notification.save()
      const populatedNotification = await notification.populate("sender","name avatar")
      //send realtime notification
      const io = req.app.get("io")
      const userSockets = req.app.get("userSockets");
      const recipientSocketId = userSockets.get(comment.owner.toString());
      if(recipientSocketId){
        io.to(recipientSocketId).emit("receiveNotification",populatedNotification)
      }
    }
    //======================= end socket ==============================================
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// delete one comment
router.delete("/:commentId",AuthMiddleware,async(req,res)=>{
  try{
    const deletedComment = await CommentModel.findOneAndDelete({owner:req.user.id,_id:req.params.commentId})
    if(!deletedComment){
      return res.status(404).json({ message: "comment not found" });
    }
    res.status(200).json({message:"comment deleted successfully"})
  }catch(error){
    res.status(500).json({message:error.message})
  }
})
//delete replay
router.delete("/replay/:commentId/:replayId",AuthMiddleware,async(req,res)=>{
  try{
    const updatedComment = await CommentModel.findOneAndUpdate({_id:req.params.commentId},{
                // ⭐️ $pull: لحذف عنصر من مصفوفة 'replies'
                $pull: {
                    replies: {
                        // ⭐️ الشرط الأول: مطابقة ID الرد
                        _id: req.params.replayId,
                        // ⭐️ الشرط الثاني: مطابقة ID المالك (الأمان)
                        owner: req.user.id 
                    }
                }
            },
            { new: true }) // لإرجاع المستند بعد التحديث)
            // 2. التحقق من نجاح الحذف أو العثور على التعليق
        if (!updatedComment) {
            return res.status(404).json({ message: "Comment not found." });
        }
        res.status(200).json({ message: "Reply deleted successfully", comment: updatedComment });
  }catch(error){
    res.status(500).json({message:error.message})
  }
})
module.exports = router;
