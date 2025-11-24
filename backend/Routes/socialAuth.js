// خاص بتسجيل الدخول عن طريق جوجل
const express = require("express");
const passport = require("passport");
const router = express.Router();
const jwt = require("jsonwebtoken");

function setAuthCookie(res, token) {
  // إعداد الكوكيز مع الخيارات المناسبة
  res.cookie("token", token, {
    httpOnly: true,
    secure: true, //process.env.NODE_ENV === "production"
    sameSite: "None",//process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 أسبوع
  });
}
//google
//step-1
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
); // بدء المصادقة
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/signin" , session: false}),
  (req, res) => {
    // 1. إنشاء رمز JWT هنا
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }); // 2. تخزين التوكن في الكوكي باستخدام الدالة المساعدة
    setAuthCookie(res, token);
    res.redirect(`${process.env.FRONTEND_URL}/`);
  }
);

//facebook

// مسارات فيسبوك (الجديدة)
router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] }) // طلب الإذن بالوصول إلى البريد الإلكتروني
);
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/signin" , session: false}),
  (req, res) => {
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }); // 2. تخزين التوكن في الكوكي باستخدام الدالة المساعدة
    setAuthCookie(res, token);
    res.redirect(`${process.env.FRONTEND_URL}/`);
  }
);

module.exports = router;
