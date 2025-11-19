// Map لتخزين المستخدمين النشطين (UserID -> Socket ID)
// خاص بالاتصال الصوتي 
const activeCallUsers = new Map(); 

const callSocketHandler = (io, socket) => {
    const userId = socket.handshake.query.userId;
    
    if (userId) {
        // تسجيل المستخدم عند الاتصال
        activeCallUsers.set(userId, socket.id);
        console.log(`Call User ${userId} connected.`);

        // 1. حدث بدء المكالمة (يرسله المتصل)
        socket.on('call-user', ({ targetUserId, offer }) => {
            const targetSocketId = activeCallUsers.get(targetUserId);

            if (targetSocketId) {
                // إرسال إشارة المكالمة الواردة إلى المتلقي
                io.to(targetSocketId).emit('incoming-call', {
                    callerId: userId,
                    offer: offer,
                    isVideo: true // يمكن أن يكون خيارًا
                });
                console.log(`Signaling: Incoming call from ${userId} to ${targetUserId}`);
            } else {
                // التعامل مع المستخدم غير المتصل
                socket.emit('call-failed', { message: 'المستخدم غير متصل حاليًا.' });
            }
        });

        // 2. حدث الرد على المكالمة (يرسله المتلقي)
        socket.on('call-answered', ({ targetUserId, answer }) => {
            const targetSocketId = activeCallUsers.get(targetUserId);
            
            if (targetSocketId) {
                // إرسال الـ Answer إلى المتصل الأصلي
                io.to(targetSocketId).emit('answer-received', {
                    answer: answer
                });
            }
        });

        // 3. تبادل مرشحات الاتصال (ICE Candidates)
        socket.on('ice-candidate', ({ targetUserId, candidate }) => {
            const targetSocketId = activeCallUsers.get(targetUserId);
            
            if (targetSocketId) {
                // إرسال الـ candidate للطرف الآخر
                io.to(targetSocketId).emit('ice-candidate-received', {
                    candidate: candidate
                });
            }
        });

        // 4. إنهاء المكالمة
        socket.on('call-end', ({ targetUserId }) => {
            const targetSocketId = activeCallUsers.get(targetUserId);
            if (targetSocketId) {
                io.to(targetSocketId).emit('call-ended-by-peer');
            }
        });

        // 5. التنظيف عند قطع الاتصال
        socket.on('disconnect', () => {
            activeCallUsers.delete(userId);
            console.log(`Call User ${userId} disconnected.`);
        });
    }
};

module.exports = callSocketHandler;