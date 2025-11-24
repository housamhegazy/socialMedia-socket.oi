//خاصه بتسجيل الدخول عن طريق جوجل
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy; // <--- إضافة هذا السطر
const TwitterStrategy = require("passport-twitter").Strategy;

const User = require("../Models/User");
//نستدعي الملف اللي هانرفع بيه الصور للكلاود
const uploadAvatarToCloudinary = require("./uploadfromsocialtoCloudinary");

passport.use(
  new GoogleStrategy(
    {
      // ... (الإعدادات تبقى كما هي)
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://socialmedia-socket-oi.onrender.com/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        let user =
          (await User.findOne({ googleId: profile.id })) ||
          (profile.emails?.length
            ? await User.findOne({ email: profile.emails[0].value })
            : null); // الحصول على الصورة بأعلى جودة ممكنة (لا تغيير)

        const rawAvatar = profile.photos?.[0]?.value
          ? profile.photos[0].value.replace(/=s\d+-c$/, "=s800-c")
          : "";

        let newAvatarUrl = ""; // متغير لتخزين رابط الصورة المرفوعة

        if (user) {
          user.googleId = profile.id;
          // 💡 1.  إذا كان المستخدم موجودًا، ارفع الصورة باستخدام user._id فقط اذا كان المستخدم لا يملك صوره شخصيه
          if (rawAvatar && !user.avatar) { 
            const publicId = user._id.toString();
            newAvatarUrl = await uploadAvatarToCloudinary(
              rawAvatar,
              publicId,
              user._id.toString()
            );
          }
          if (newAvatarUrl) user.avatar = newAvatarUrl;
        } else {
          // إنشاء المستخدم أولاً بدون صورة البروفايل المرفوعة
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value || "", // وضع رابط الصورة الخام مؤقتاً أو تركه فارغاً
            avatar: "",// ⬅️ **تصحيح حاسم:** نجعله فارغاً لضمان تحديثه بعد الرفع
            providers: ["google"],
          });

          // 💡 2. بعد إنشاء المستخدم، استخدم user._id لرفع الصورة وتحديث المستند
          if (rawAvatar) {
            const publicId = user._id.toString();
            newAvatarUrl = await uploadAvatarToCloudinary(
              rawAvatar,
              publicId,
              user._id.toString()
            );

            if (newAvatarUrl) {
              user.avatar = newAvatarUrl;
            }
          }
        }

        if (!user.providers.includes("google")) user.providers.push("google");
        user.lastLogin = new Date();
        await user.save();

        return cb(null, user);
      } catch (error) {
        console.error("Error in Google Strategy:", error);
        return cb(error, null);
      }
    }
  )
)
//======================================================================================================================
//======================================================================================================================
//======================================================================================================================

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "https://socialmedia-socket-oi.onrender.com/auth/facebook/callback",
      profileFields: ["id", "displayName", "photos", "email"],
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        // 1. العثور على المستخدم أو إنشاؤه أولاً
        let user = await User.findOne({ facebookId: profile.id });

        if (!user) {
          if (profile.emails && profile.emails.length > 0) {
            user = await User.findOne({ email: profile.emails[0].value });
          }

          if (user) {
            // المستخدم موجود بالإيميل
            user.facebookId = profile.id; // الصورة سيتم تحديثها لاحقاً
          } else {
            // تسجيل جديد
            user = await User.create({
              facebookId: profile.id,
              name: profile.displayName,
              email: profile.emails?.[0]?.value,
              providers: ["facebook"], // الصورة سيتم إضافتها لاحقاً بعد الحصول على _id
            });
          }
        }

        // ----------------------------------------------------------------------
        // 2. معالجة ورفع الصورة بعد التأكد من وجود كائن 'user' و 'user._id'
        // ----------------------------------------------------------------------

        let uploadedUrl = null;

        // جلب رابط الصورة عالي الدقة
        const fetch = (await import("node-fetch")).default;
        const fbPhotoUrl = `https://graph.facebook.com/${profile.id}/picture?type=large&redirect=false&access_token=${accessToken}`;
        const fbResponse = await fetch(fbPhotoUrl);
        const fbData = await fbResponse.json();
        const highResUrl = fbData?.data?.url;

        if (highResUrl && user && !user.avatar) {
          const publicId = user._id.toString(); // نستخدم معرف المستخدم كـ publicId
          const userIdString = user._id.toString(); // نستخدم معرف المستخدم كـ userId للمجلد

          // ✅ الرفع الآن مع تمرير publicId و userId
          uploadedUrl = await uploadAvatarToCloudinary(
            highResUrl,
            publicId,
            userIdString
          );

          // تحديث رابط الصورة في مستند المستخدم
          user.avatar = uploadedUrl;
        }

        // 3. إنهاء وحفظ المستخدم
        if (!user.providers.includes("facebook"))
          user.providers.push("facebook");
        user.lastLogin = new Date();
        await user.save();

        return cb(null, user);
      } catch (error) {
        console.error("Error in Facebook Strategy:", error);
        return cb(error, null);
      }
    }
  )
)
