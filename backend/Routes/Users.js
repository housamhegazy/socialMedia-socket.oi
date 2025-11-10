const express = require("express");
const router = express.Router();
const User = require("../Models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { AuthMiddleware } = require("../Middleware/AuthMiddleware.js");

// protected route to set auth cookie
function setAuthCookie(res, token) {
  // إعداد الكوكيز مع الخيارات المناسبة
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
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
  try {
    res.clearCookie("token", {
      httpOnly: true, // ✅ يمنع الوصول للتوكن من الجافاسكريبت في المتصفح
      secure: process.env.NODE_ENV === "production", // ✅ الكوكي تكون محمية في HTTPS فقط في الإنتاج
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // ⚠️ تعديل مهم
      path: "/", // ✅ يضمن حذف الكوكي من كل المسارات
    });
    console.log("signedout");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("❌ Logout error:", error.message);
    return res.status(500).json({ error: "Logout failed" });
  }
});

// الدخول على صفحة اي مستخدم في تويتر عن طريق الاي دي
router.get("/:username", AuthMiddleware,async (req, res) => {
  // Retrieve user by ID
  try {
    const user = await User.findOne({ username: req.params.username })

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
    console.log("user is " , user)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
