const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    text: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "UserSchema", // ربط هذا الحقل بنموذج المستخدم
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserSchema", // ربط هذا الحقل بنموذج المستخدم
      },
    ],
  },
  {
    timestamps: true, // لإضافة حقلي createdAt و updatedAt تلقائياً
  }
);

// إنشاء Model من الـ Schema
const PostModel = mongoose.model("Post", PostSchema);

module.exports = PostModel;
