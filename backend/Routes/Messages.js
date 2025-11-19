const express = require('express');
const router = express.Router();
const Message = require('../Models/Message');
const { AuthMiddleware } = require("../middleware/authMiddleware");

// جلب رسائل محادثة معينة (التاريخ)
// GET /api/messages/:chatId
router.get('/:chatId', AuthMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({ chatId: req.params.chatId })
        .populate('sender', 'username avatar') 
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// لا نحتاج لمسار POST هنا لأن الرسائل الجديدة سترسل عبر Socket.IO

module.exports = router;