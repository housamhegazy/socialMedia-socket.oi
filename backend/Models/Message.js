const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
    {
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat', // يربط هذا النموذج بنموذج المحادثة
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // يفترض أن لديك نموذج User
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        // إذا أردت إضافة خاصية "تم القراءة"
        readBy: [{ 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }], 
    },
    { timestamps: true }
);

module.exports = mongoose.model('Message', MessageSchema);