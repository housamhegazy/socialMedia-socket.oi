// models/User.js
const mongoose = require("mongoose");

// في حالة الدخول بحساب فيس او جوجل فهو لا يحتوي على اسم مستخدم
// 💡 1. الدالة المساعدة لتوليد اسم مستخدم فريد
function generateUsername(fullName, email) {
  let base = "";
  if (email) {
    // نأخذ الجزء الأول من الإيميل
    base = email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  } else if (fullName) {
    // أو نستخدم الاسم الكامل مع إزالة المسافات
    base = fullName.toLowerCase().replace(/\s/g, "");
  }

  // في حال فشل كل شيء، نستخدم "user"
  if (base.length < 3) {
    base = "user";
  }

  // إضافة لاحقة عشوائية
  const uniqueSuffix = Math.random().toString(36).substring(2, 6);
  return `${base}${uniqueSuffix}`;
}
const UserSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: false, // غير مطلوب للمستخدمين العاديين
      unique: true, // يجب أن يكون فريدًا
      sparse: true, // يسمح بوجود العديد من المستخدمين الذين لا يملكون هذا الحقل
    },
    facebookId: {
      type: String,
      required: false, // غير مطلوب للمستخدمين العاديين
      unique: true, // يجب أن يكون فريدًا
      sparse: true, // يسمح بوجود العديد من المستخدمين الذين لا يملكون هذا الحقل
    },
    providers: [
      {
        type: String,
        enum: ["local", "google", "facebook"],
        default: ["local"],
      },
    ], // مصفوفة للمزودين,
    username: {
      type: String,
      // required: [true, "username is required."],
      unique: true, //
      trim: true,
    },
    name: {
      type: String,
      required: [true, "full name is required."],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true, // يجب أن يكون البريد الإلكتروني فريدًا
      trim: true,
      lowercase: true, // تخزين البريد الإلكتروني بأحرف صغيرة
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."], // تحقق من صيغة البريد الإلكتروني
    },

    password: {
      type: String,
      // required: [true, "Password is required."],
      minlength: [6, "Password must be at least 6 characters long."], // الحد الأدنى لطول كلمة المرور
      select: false, // لا يتم إرجاع كلمة المرور في الاستعلامات افتراضيًا لأسباب أمنية
    },
    avatar: {
      type: String,
      public_id: String,
      default:
        process.env.CLOUDINARY_DEFAULT_AVATAR_URL ||
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    coverPhoto: {
      url: {
        type: String,
        default:
          process.env.CLOUDINARY_DEFAULT_COVER_URL ||
          "https://res.cloudinary.com/ditaxyrbs/image/upload/v1679171880/samples/landscapes/landscape-panorama.jpg",
      },
      public_id: {
        type: String,
      },
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastLogin: {
      // <--- NEW FIELD: lastLogin
      type: Date,
      default: null, // It will be null until the first successful login
    },
    resetToken: {
      type: String,
    },
    resetTokenExpire: {
      type: String,
    },
  },
  {
    timestamps: true, // لإضافة حقلي createdAt و updatedAt تلقائياً
  }
);
// 💡 2. إضافة Middleware 'pre-save' للتعامل مع توليد اسم المستخدم
UserSchema.pre("save", async function (next) {
  // ⚠️ يجب استخدام دالة عادية (function) هنا وليس Arrow Function للحفاظ على this
  const user = this;

  // الشرط: إذا كان المستخدم يسجل دخوله لأول مرة عبر منصة اجتماعية
  // ولم يقم بتعيين اسم مستخدم (أي أن حقل username فارغ)
  if (user.isNew && !user.username) {
    let generatedUsername = "";
    let isUnique = false;
    let attempts = 0;

    // نبقى في حلقة حتى نجد اسم مستخدم فريد (لمنع التعارض مع قاعدة البيانات)
    while (!isUnique && attempts < 5) {
      generatedUsername = generateUsername(user.name, user.email);

      // تحقق من وجود اسم المستخدم في قاعدة البيانات
      const existingUser = await mongoose.models.User.findOne({
        username: generatedUsername,
      });

      if (!existingUser) {
        isUnique = true;
        user.username = generatedUsername;
      }
      attempts++;
    }

    if (!isUnique) {
      // يمكن التعامل مع فشل التوليد هنا، مثلاً رمي خطأ
      console.error(
        "Failed to generate unique username after multiple attempts."
      );
    }
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
