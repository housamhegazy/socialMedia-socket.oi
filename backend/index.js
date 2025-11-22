const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
require("dotenv").config();
//====================== خاص ب  passport  ==========================================
const session = require("express-session"); // <--- إضافة هذا
const passport = require("passport"); // إضافة passport
require("./Utils/passport.js"); // استيراد إعداد passport
//====================================================================================
const cors = require("cors"); // للسماح لـ frontend بالاتصال بـ backend
// 💡 استيراد نماذج الدردشة والرسائل (جديد)
const Chat = require('./Models/Chat'); 
const Message = require('./Models/Message');
// const path = require("path");
// const methodOverride = require("method-override");
const cookieParser = require("cookie-parser"); // لتحليل الكوكيز
const callSocketHandler = require('./socketServer'); // 💡 استدعاء ملف الـ Handler الجديد
//======================================start websocket and socket io ========================================
//npm install socket.io-client
//    npm install ws
//npm install socket.io
//============================================= socket imports ===========================================
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});
const userSockets = new Map();
// Save io + userSockets to app
app.set("io", io);
app.set("userSockets", userSockets); 
//======================================== end socket import ============================

//========================================== cors =======================================
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, // للسماح بإرسال الكوكيز مع الطلبات
  })
);

app.use(cookieParser());
app.use(express.json());
//=================== passport session موجود عشان تسجيل الدخول بتويتر فقط لكن باقي الموقع ب jwt ====================
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', 
    resave: false, 
    saveUninitialized: false, 
    cookie: { 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 1000 * 60 * 60 * 24 // 24 ساعة
    }
}));

//============================================get routes======================================================
// إعداد Passport لتسجيل الدخول بجوجل 
app.use(passport.initialize());
// app.use(passport.session());

const registerRoute = require("./Routes/Users.js");
const postsRoute = require("./Routes/Posts.js");
const commentsRoute = require("./Routes/Comments.js");
const notificationRoute = require("./Routes/Notification.js");
const chatRoute = require("./Routes/Chat.js");
const messagesRoute = require("./Routes/Messages.js");
const friendRequistRoute = require("./Routes/friendRoutes.js")
const socialLogInRoute = require("./Routes/socialAuth.js")

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/users", registerRoute);
app.use("/api/posts", postsRoute);
app.use("/api/comments", commentsRoute);
app.use("/notifications", notificationRoute);
app.use("/api/chat", chatRoute);
app.use("/api/messages", messagesRoute);
app.use("/api/friendrequist",friendRequistRoute)
app.use("",socialLogInRoute)


//=================================================auto refresh================================================
// app.use(methodOverride("_method"));// لتمكين استخدام طرق HTTP مثل PUT و DELETE
// //begin livereload
// const livereload = require("livereload");
// const liveReloadServer = livereload.createServer(); // إنشاء سيرفر LiveReload
// liveReloadServer.watch(path.join(__dirname, "public"));
// const connectLivereload = require("connect-livereload"); // استيراد Middleware
// app.use(connectLivereload());
// liveReloadServer.server.once("connection", () => {
//   setTimeout(() => {
//     liveReloadServer.refresh("/");
//   }, 100);
// });
//end livereload
//======================================socket io connection handling to notifications and send messages and call ================================================

io.on("connection", (socket) => {

  // منطق الاتصال عند تسجيل الدخول وجلب الاشعارات
  console.log("user connected", socket.id);

  //======================================= call ======================================
  callSocketHandler(io, socket);
  //======================================== ==========================================
  //user joints with ther id
  socket.on("join", (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`user ${userId} joint with socket ${socket.id}`);
  });

  // 2. المنطق الجديد: الانضمام إلى غرفة المحادثة
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat room: ${chatId}`);
  }); 

  // ============================================3. المنطق الجديد: إرسال الرسائل============================================
  socket.on("send_message", async (data) => {
    const { chatId, senderId, text } = data;
    try {
      // أ. حفظ الرسالة في قاعدة البيانات
      const newMessage = new Message({
        chatId: chatId,
        sender: senderId,
        text: text,
      });
      const savedMessage = await newMessage.save(); // ب. تحديث آخر رسالة في نموذج المحادثة

      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: savedMessage._id,
        updatedAt: Date.now(),
      }); // ج. جلب بيانات المرسل (لتمريرها كاملة للفرونت إند)
      const messageWithSender = await Message.findById(
        savedMessage._id
      ).populate("sender", "username profilePicture"); // د. بث الرسالة إلى جميع أعضاء الغرفة
      io.to(chatId).emit("receive_message", messageWithSender);
    } catch (error) {
      console.error("Error saving or broadcasting message:", error);
      socket.emit("message_error", "Failed to send message.");
    }

    
  });

  // عند قطع الاتصال
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

//======= export for use in routes
module.exports = { io, userSockets };
//=================================================connect to mongodb================================================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));
//=================================================start server================================================
httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
