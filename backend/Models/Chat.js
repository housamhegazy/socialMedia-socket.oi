const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema(
    {
        members: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required:true
            }],
            required: true,
            // نضمن وجود طرفين فقط في المحادثة الثنائية
            validate: [arrayLimit, 'Chat must have exactly 2 members']
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            default: null, // آخر رسالة تم إرسالها
        },
    },
    { timestamps: true }
);

function arrayLimit(val) {
    return val.length === 2;
}

// يمكن إضافة مؤشر لضمان عدم تكرار المحادثات بين نفس الطرفين
ChatSchema.index({ members: 1, members: -1 }, { unique: true });

module.exports = mongoose.model('Chat', ChatSchema);