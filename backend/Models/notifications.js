const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    // الشخص اللي هيستقبل الإشعار
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // الشخص اللي عمل الأكشن (اللي عمل لايك / كومنت / فولو)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // نوع الإشعار
    type: {
      type: String,
      enum: ["like", "comment", "reply"],
      required: true,
    },

    // لو الإشعار متعلق ببوســت
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },

    // محتوى إضافي (مثلاً نص الكومنت)
    content: {
      type: String,
      default: "",
    },

    // هل الإشعار اتقرا ولا لا
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
