// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
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
      required: [true, "Password is required."],
      minlength: [6, "Password must be at least 6 characters long."], // الحد الأدنى لطول كلمة المرور
      select: false, // لا يتم إرجاع كلمة المرور في الاستعلامات افتراضيًا لأسباب أمنية
    },
    avatar: {
      type: String,
      default:
        process.env.CLOUDINARY_DEFAULT_AVATAR_URL ||
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    lastLogin: {
      // <--- NEW FIELD: lastLogin
      type: Date,
      default: null, // It will be null until the first successful login
    },
  },
  {
    timestamps: true, // لإضافة حقلي createdAt و updatedAt تلقائياً
  }
);

module.exports = mongoose.model("User", UserSchema);
