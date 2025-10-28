const cloudinary = require("cloudinary").v2
require("dotenv").config();


// يجب أن تكون هذه الأسطر في ملف server.js أو ملف إعداد Cloudinary الخاص بك
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // يفضل استخدام HTTPS
});

module.exports = cloudinary;