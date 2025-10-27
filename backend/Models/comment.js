const { text } = require("body-parser");
const mongoose = require("mongoose");


const ReplySchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: "User" 
    }, // يجب أن يشير إلى نموذج المستخدم
    text: { 
        type: String, 
        required: true,
        trim: true 
    },
    // لا نحتاج لـ createdAt هنا، يمكننا استخدامه في الخيارات.
}, {
    timestamps: true // لإضافة createdAt و updatedAt لكل رد
});

const CommentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,required: true,ref: "PostSchema", // ربط هذا الحقل بنموذج البوست
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,required: true,ref: "UserSchema", // ربط هذا الحقل بنموذج المستخدم
    },
    text: { //comment text
      type: String,createdAt: { type: Date, default: Date.now },
    },
    replies: {
      type: [ReplySchema], // مصفوفة من الردود
      default: [],
  },},
  {
    timestamps: true, // لإضافة حقلي createdAt و updatedAt تلقائياً
  }
);

// إنشاء Model من الـ Schema
const CommentModel = mongoose.model("Post", CommentSchema);

module.exports = CommentModel;
