require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
//====================== خاص ب  passport  ==========================================
const passport = require("passport"); // إضافة passport
require("./Utils/passport.js"); // استيراد إعداد passport
const initializeSocket = require("./Utils/socketHandler"); // استيراد ملف معالج الويب سوكيت
const cors = require("cors"); // للسماح لـ frontend بالاتصال بـ backend
const cookieParser = require("cookie-parser"); // لتحليل الكوكيز

//=====================================================start websocket and socket io =====================================================
const { createServer } = require("http");
const httpServer = createServer(app);

const userSockets = new Map();

// ✅ إنشاء socket.io وربطه بالسيرفر
const { io, userSockets: initializedUserSockets } = initializeSocket(
  httpServer,
  userSockets
);

// تخزين io & userSockets لاستخدامهم في الراوتر
app.set("io", io);
app.set("userSockets", initializedUserSockets);
//================================================================ cors ================================================================
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // للسماح بإرسال الكوكيز مع الطلبات
  })
);
//====================================================== middlewares ==============================================================
app.use(cookieParser());
app.use(express.json());

//====================== خاص ب  passport  ==========================================
app.use(passport.initialize());
// app.use(passport.session());

//======================================================================get routes======================================================
const registerRoute = require("./Routes/Users.js");
const postsRoute = require("./Routes/Posts.js");
const commentsRoute = require("./Routes/Comments.js");
const notificationRoute = require("./Routes/Notification.js");
const chatRoute = require("./Routes/Chat.js");
const messagesRoute = require("./Routes/Messages.js");
const friendRequistRoute = require("./Routes/friendRoutes.js");
const socialLogInRoute = require("./Routes/socialAuth.js");

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/users", registerRoute);
app.use("/api/posts", postsRoute);
app.use("/api/comments", commentsRoute);
app.use("/notifications", notificationRoute);
app.use("/api/chat", chatRoute);
app.use("/api/messages", messagesRoute);
app.use("/api/friendrequist", friendRequistRoute);
app.use("", socialLogInRoute);
//=================================================connect to mongodb================================================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));
//=================================================start server================================================
httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
