const express = require("express");
const router = express.Router();
const User = require("../Models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  // Handle user registration
  console.log("Registering user:", req.body.name);
  try {
    const { name, email, password } = req.body;
    // تحقق مما إذا كان المستخدم موجودًا بالفعل
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // إنشاء مستخدم جديد

    const hashedPassword = await bcrypt.hash(password, 10); // 10 مستوى صعوبة التشفير
    const NewUser = new User({
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

    res.status(201).json({
      message: "user registered successfully",
      token,
      user: {
        id: NewUser._id,
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

router.get("/:id", async (req, res) => {
  // Retrieve user by ID
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me/profile", async (req, res) => {
    // Retrieve user by ID
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
