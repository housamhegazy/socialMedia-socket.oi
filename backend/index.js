const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
require("dotenv").config();
const cors = require("cors"); // للسماح لـ frontend بالاتصال بـ backend
const path = require("path");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser"); // لتحليل الكوكيز

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
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use("/api/users", registerRoute);
app.use("/api/posts",postsRoute)
app.use("/api/comments",commentsRoute)

//=================================================auto refresh================================================
app.use(methodOverride("_method"));// لتمكين استخدام طرق HTTP مثل PUT و DELETE
//begin livereload
const livereload = require("livereload"); 
const liveReloadServer = livereload.createServer(); // إنشاء سيرفر LiveReload
liveReloadServer.watch(path.join(__dirname, "public"));
const connectLivereload = require("connect-livereload"); // استيراد Middleware
app.use(connectLivereload());
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});
//end livereload
//=================================================connect to mongodb================================================
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("Could not connect to MongoDB...", err));
//=================================================start server================================================
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})