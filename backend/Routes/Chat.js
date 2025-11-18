const express = require("express");
const router = express.Router();
const Chat = require("../Models/Chat");
const Message = require("../Models/Message");
const { AuthMiddleware } = require("../middleware/authMiddleware.js");

// 1. جلب محادثات مستخدم معين (يستخدم لعرض قائمة المحادثات)
// GET /api/chats
router.get("/", AuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // يفترض أن الـ ID يأتي من الـ middleware
    const chats = await Chat.find({
      members: { $in: [userId] }, // ابحث عن المحادثات التي يكون المستخدم طرفاً فيها
    })
      .populate("members", "username avatar") // جلب بيانات الطرف الآخر
      .populate("lastMessage") // جلب آخر رسالة
      .sort({ updatedAt: -1 }); // ترتيب تنازلي حسب آخر تحديث

    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. إنشاء محادثة جديدة (أو جلب محادثة موجودة)
// POST /api/chats
router.post("/", AuthMiddleware, async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user.id;
const members = [senderId, receiverId].map(id => id.toString()).sort();
  try {
    let chat = await Chat.findOne({
      members: {
        $all: [senderId, receiverId],
        $size: 2, // للتأكد من أنها محادثة ثنائية وليست جماعية أكبر
      },
    });

    if (!chat) {
      chat = new Chat({ members: members });
      await chat.save();
    }

    // جلب البيانات بعد التحديث
    chat = await chat.populate("members", "username avatar");

    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: "Failed to create or retrieve chat.", error: err.message });
  }
});

module.exports = router;
