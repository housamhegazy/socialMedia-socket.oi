const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
    // المُرسِل هو الشخص الذي أرسل الطلب (مثلاً: User A)
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // المُتَلَقِّي هو الشخص الذي يجب أن يقبل الطلب (مثلاً: User B)
    receiver: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // الحالة: Pending (معلق)، Accepted (مقبول)، Rejected (مرفوض)
    status: { 
        type: String, 
        enum: ['Pending', 'Accepted', 'Rejected'], 
        default: 'Pending' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
}, { timestamps: true });

module.exports = mongoose.model('FriendRequest', friendRequestSchema);