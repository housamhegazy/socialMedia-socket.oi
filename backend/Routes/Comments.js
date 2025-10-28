const express = require("express");
const router = express.Router();
const CommentModel = require("../Models/comment.js");
const { AuthMiddleware } = require("../Middleware/AuthMiddleware.js");
const PostModel = require("../Models/Post.js");
require("dotenv").config();

router.post("/:postId", AuthMiddleware, async (req, res) => {
  try {
    const post = await CommentModel.findById(req.params.postId);
    const { text } = req.body;
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
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// لجلب كل التعليقات على البوست سواء كانت من المستخدم ام من مستخدمين اخرين
router.get("/:postId", AuthMiddleware, async (req, res) => {
  try {
    const comments = await CommentModel.find({ post: req.params.postId })
      .populate("owner", "name email avatar") // استبدال اي دي مالك البوست باسمه وصورته وايميله
      .populate("replies.user", "name avatar")
      .sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//add replies to comment
router.post("/replay/:commentId", AuthMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    //من الأفضل التأكد من أن المستخدم قد أرسل نصًا فعليًا في الرد.
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Reply text is required." });
    }

    const updatedComment = await CommentModel.findByIdAndUpdate(
      req.params.commentId,
      {
        $push: {
          replies: { owner: req.user.id, text },
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
