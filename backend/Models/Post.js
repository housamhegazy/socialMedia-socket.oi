const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User", // ربط هذا الحقل بنموذج المستخدم
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // ربط هذا الحقل بنموذج المستخدم
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
