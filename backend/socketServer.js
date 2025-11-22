module.exports = function (io) {
  // مستخدمين المكالمة
  const activeCallUsers = new Map(); // { userId: socketId }

  io.on("connection", (socket) => {
    console.log("🔌 New socket connected:", socket.id);

    // ======================================================
    //  1) استقبال userId من الـ handshake (لو موجود)
    // ======================================================
    const handshakeUserId = socket.handshake.query.userId;

    if (handshakeUserId) {
      activeCallUsers.set(handshakeUserId, socket.id);
      console.log(`📥 Registered via handshake → ${handshakeUserId} = ${socket.id}`);
    }

    // ======================================================
    //  2) تسجيل المستخدم عند دخوله مكالمة
    // ======================================================
    socket.on("join_call", ({ userId }) => {
      if (!userId) return;

      activeCallUsers.set(userId, socket.id);
      console.log(`🎧 User joined call → ${userId} = ${socket.id}`);
    });

    // ======================================================
    //  3) إرسال OFFER
    // ======================================================
    socket.on("send_offer", ({ targetUserId, offer }) => {
      const targetSocketId = activeCallUsers.get(targetUserId);

      if (!targetSocketId) {
        console.log("❌ Target user not connected:", targetUserId);
        return;
      }

      io.to(targetSocketId).emit("receive_offer", { offer });
      console.log(`📤 Sent OFFER → ${targetUserId}`);
    });

    // ======================================================
    //  4) إرسال ANSWER
    // ======================================================
    socket.on("send_answer", ({ targetUserId, answer }) => {
      const targetSocketId = activeCallUsers.get(targetUserId);

      if (!targetSocketId) {
        console.log("❌ Target user not connected:", targetUserId);
        return;
      }

      io.to(targetSocketId).emit("receive_answer", { answer });
      console.log(`📤 Sent ANSWER → ${targetUserId}`);
    });

    // ======================================================
    //  5) إرسال ICE CANDIDATE
    // ======================================================
    socket.on("send_ice_candidate", ({ targetUserId, candidate }) => {
      const targetSocketId = activeCallUsers.get(targetUserId);

      if (targetSocketId) {
        io.to(targetSocketId).emit("receive_ice_candidate", { candidate });
      }
    });

    // ======================================================
    //  6) عند فصل المستخدم
    // ======================================================
    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);

      // حذف أي userId مربوط بنفس socket
      for (const [userId, sId] of activeCallUsers.entries()) {
        if (sId === socket.id) {
          activeCallUsers.delete(userId);
          console.log(`🗑️ Removed user from call list: ${userId}`);
        }
      }
    });
  });
};
