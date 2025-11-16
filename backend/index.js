const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
require("dotenv").config();
const cors = require("cors"); // للسماح لـ frontend بالاتصال بـ backend
// const path = require("path");
// const methodOverride = require("method-override");
const cookieParser = require("cookie-parser"); // لتحليل الكوكيز

//======================================start websocket and socket io ========================================
//npm install socket.io-client
//    npm install ws
//npm install socket.io
const {createServer} = require("http")
const {Server} = require("socket.io")
const httpServer = createServer(app)
const io = new Server(httpServer,{
  cors:{
    origin: "http://localhost:5173", 
  credentials: true, 
  }
})
const userSockets = new Map()
// Save io + userSockets to app
app.set("io",io)
app.set("userSockets", userSockets); // ← Add this


app.use(cors({
  origin: "http://localhost:5173", // استبدل هذا بعنوان الـ frontend الخاص بك
  credentials: true, // للسماح بإرسال الكوكيز مع الطلبات
}));

app.use(cookieParser());
app.use(express.json());
//============================================get routes======================================================
 
const registerRoute = require("./Routes/Users.js");
const postsRoute = require("./Routes/Posts.js")
const commentsRoute = require("./Routes/Comments.js")
const notificationRoute = require("./Routes/Notification.js")
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use("/api/users", registerRoute);
app.use("/api/posts",postsRoute)
app.use("/api/comments",commentsRoute)
app.use("/notifications",notificationRoute)


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
//======================================socket io connection handling ================================================

io.on("connection",(socket)=>{
  console.log("user connected",socket.id);
  //user joints with ther id 
  socket.on("join",(userId)=>{
    userSockets.set(userId,socket.id)
    console.log(`user ${userId} joint with socket ${socket.id}`);
  })
  socket.on("disconnect",()=>{
    for (let[userId,socketId]of userSockets.entries()){
      if(socketId === socket.id){
        userSockets.delete(userId)
        console.log(`user ${userId} disconnected`);
        break
      }
    }
  })
})

//======= export for use in routes 
module.exports = { io, userSockets };
//=================================================connect to mongodb================================================
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("Could not connect to MongoDB...", err));
//=================================================start server================================================
httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})