const express = require("express");
const router = express.Router();
const User = require("../Models/User.js");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { AuthMiddleware } = require("../Middleware/AuthMiddleware.js");
const sendEmail = require("../Utils/sendEmail.js");

const {
  cloudinary,
  bufferToDataUri,
  upload,
} = require("../Utils/cloudinary.js");
// protected route to set auth cookie
function setAuthCookie(res, token) {
  // تحديد ما إذا كانت البيئة إنتاجية أم لا
  const isProduction = process.env.NODE_ENV === "production";
  // إعداد الكوكيز مع الخيارات المناسبة
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction, //process.env.NODE_ENV === "production" اثناء التطوير يكون
    sameSite: isProduction ? "None" : "Lax", //process.env.NODE_ENV === "production" ? "Strict" : "Lax"
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 أسبوع
  });
}

// dont forget to npm install cookie-parser in backend

router.post("/register", async (req, res) => {
  // Handle user registration
  try {
    const { username, name, email, password } = req.body;
    // تحقق مما إذا كان المستخدم موجودًا بالفعل
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // تحقق مما إذا كان اسم المستخدم موجودًا بالفعل
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // إنشاء مستخدم جديد

    const hashedPassword = await bcrypt.hash(password, 10); // 10 مستوى صعوبة التشفير
    const NewUser = new User({
      username,
      name,
      email,
      password: hashedPassword,
    });
    // حفظ المستخدم في قاعدة البيانات
    await NewUser.save();

    // إنشاء وتوقيع JWT
    const token = jwt.sign({ id: NewUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    setAuthCookie(res, token);

    res.status(201).json({
      message: "user registered successfully",
      token,
      user: {
        id: NewUser._id,
        username: NewUser.username,
        name: NewUser.name,
        email: NewUser.email,
        avatar: NewUser.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  // Handle user login
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "email not found" });
    }
    // التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // إنشاء وتوقيع JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    setAuthCookie(res, token);
    // تحديث حقل lastLogin
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//====1- find user by email ==== 2- create (resettoken) and (resettokenexpire) in usermodel
//=== 3- create link (link+token) to open (change password page) and send this link to email by nodemailer
//=== 4- whene press link in email , open reset password page , 
//=== 5- take (token from params & neww password == rq.body )
//=== 5- find the User that have (resettoken) and (resettokenexpire) 
//=== 6- Hash password and save it user 
//=== 7- make (resettoken) and (resettokenexpire) = null , then save user



//reset password request
router.post("/forget-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist." });
    }
    // إنشاء توكن
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    // رابط الريسيت
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    // إرسال الإيميل
    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" target="_blank">
          Reset Password
        </a>
      `,
    });

    res.json({ message: "Reset link sent to email" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});
//change password
router.put("/reset-password", async (req, res) => {
  const { password, token } = req.body;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() }, // لازم يكون لسه شغال
    });

    // 2) اعمل هاش للباسورد الجديد
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();
    res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ في السيرفر" });
  }
});
// get my profile (used in redux to get user data)
router.get("/me/profile", AuthMiddleware, async (req, res) => {
  // Retrieve user by ID
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/logout", (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  try {
    res.clearCookie("token", {
      httpOnly: true, // ✅ يمنع الوصول للتوكن من الجافاسكريبت في المتصفح
      secure: isProduction, // ✅ الكوكي تكون محمية في HTTPS فقط في الإنتاج
      sameSite: isProduction ? "None" : "Lax", // ⚠️ تعديل مهم
      path: "/", // ✅ يضمن حذف الكوكي من كل المسارات
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("❌ Logout error:", error.message);
    return res.status(500).json({ error: "Logout failed" });
  }
});

//==================================== search for users =============================================
router.get("/search", AuthMiddleware, async (req, res) => {
  try {
    const searchValue = req.query.svalue.trim();
    if (!searchValue) {
      return res.status(200).json([]);
    }
    const users = await User.find({
      $or: [
        {
          $or: [
            { username: { $regex: searchValue, $options: "i" } },
            { name: { $regex: searchValue, $options: "i" } },
            { email: { $regex: searchValue, $options: "i" } },
          ],
        },
      ],
    })
      .select("username name email avatar")
      .limit(10);
    res.status(200).json(users); // 200 OK
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ أثناء البحث" });
  }
});
//========================================== edit profile photo ==========================================
router.put(
  "/edit",
  AuthMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const imageFile = req.file;
      const ownerId = req.user.id;

      if (!imageFile) {
        return res.status(400).json({ message: "لم يتم إرسال أي صورة." });
      }

      // تحويل الملف إلى base64
      const dataUri = bufferToDataUri(imageFile.mimetype, imageFile.buffer);
      // رفع الصورة على Cloudinary
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "socialmediaApp/profileImage",
        public_id: ownerId, //  هذا هو اسم الصوره ويضمن عند رفع صوره يقوم بحذف القديمه ومن الممكن تغييره الى دالة الوقت لرفع كل صوره باسم مختلف والاحتفاظ بكل الصور
        // upload_preset: "posts-unsigned", يتم استخدامه لما ارفع صور من الفرونت اند فقط
      });
      // تحديث الصورة في قاعدة البيانات
      const updatedUser = await User.findOneAndUpdate(
        { _id: ownerId },
        { avatar: result.secure_url },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "المستخدم غير موجود." });
      }

      // ✅ رجع الصورة الجديدة
      return res.status(200).json({
        message: "تم تحديث الصورة بنجاح",
        avatar: updatedUser.avatar,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "حدث خطأ أثناء تحديث الصورة", error: error.message });
    }
  }
);

// الدخول على صفحة اي مستخدم في تويتر عن طريق الاي دي
router.get("/:username", AuthMiddleware, async (req, res) => {
  // Retrieve user by ID
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
