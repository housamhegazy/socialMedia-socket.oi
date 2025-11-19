// utils/uploadAvatarToCloudinary.js
//  هذا الملف مخصص لاستقبال الصوره الشخصيه من الفيس وتويتر وجوجل وارسالها الى كلاويدناري واستقبالها لتكون الصوره الشخصيه للمستخدم 
const { Readable } = require("stream");
const { cloudinary } = require("./cloudinary");

async function fetchImage(url) {
  const fetch = (await import("node-fetch")).default;
  
  // 👇 تعديل الحجم لو الرابط من فيسبوك
  if (url.includes("platform-lookaside.fbsbx.com")) {
    url = url
      .replace(/height=\d+/i, "height=400")
      .replace(/width=\d+/i, "width=400");
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch image");
  return response.buffer();
}

function bufferToStream(buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

function uploadBufferToCloudinary(buffer, publicId,userId) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `socialmediaApp/profileImage`,
        public_id: publicId,
        overwrite: true,
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    bufferToStream(buffer).pipe(uploadStream);
  });
}

async function uploadAvatarToCloudinary(url, publicId,userId) {
  try {
    const buffer = await fetchImage(url);
    const uploadedUrl = await uploadBufferToCloudinary(buffer, publicId,userId);
    return uploadedUrl;
  } catch (err) {
    console.error("Cloudinary upload failed:", err.message);
    return url;
  }
}

module.exports = uploadAvatarToCloudinary;