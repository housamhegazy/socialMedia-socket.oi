const { Server } = require("socket.io");
const Chat = require("../Models/Chat"); 
const Message = require("../Models/Message");

function initializeSocket(httpServer, userSockets) {
    // ✅ إنشاء io صح
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ["GET", "POST"],
            credentials: true,
        },
        transports: ["websocket"],
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // join user
        socket.on("join", (userId) => {
            userSockets.set(userId, socket.id);
            console.log(`user ${userId} joined with socket ${socket.id}`);
        });

        // join chat room
        socket.on("join_chat", (chatId) => {
            socket.join(chatId);
            console.log(`Socket ${socket.id} joined chat room: ${chatId}`);
        });
        // send message
        socket.on("send_message", async (data) => {
            const { chatId, senderId, text } = data;
            try {
                const newMessage = new Message({
                    chatId,
                    sender: senderId,
                    text,
                });

                const savedMessage = await newMessage.save();

                await Chat.findByIdAndUpdate(chatId, {
                    lastMessage: savedMessage._id,
                    updatedAt: Date.now(),
                });

                const messageWithSender = await Message.findById(savedMessage._id)
                    .populate("sender", "name username avatar");

                io.to(chatId).emit("receive_message", messageWithSender);

            } catch (error) {
                console.error("Error saving or broadcasting message:", error);
                socket.emit("message_error", "Failed to send message.");
            }
        });

        socket.on("disconnect", () => {
            for (let [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    console.log(`user ${userId} disconnected`);
                    break;
                }
            }
        });
    });

    return { io, userSockets };
}

module.exports = initializeSocket;
