import React, { useState } from "react";
import {
  Box,
  Avatar,
  InputBase,
  Typography,
  Divider,
  Button,
  Tabs,
  Tab,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  ImageOutlined,
  GifBoxOutlined,
  FormatListBulletedOutlined,
  SentimentSatisfiedOutlined,
  CalendarTodayOutlined,
  LocationOnOutlined,
  Public,
} from "@mui/icons-material";
import GrokIcon from "../../styles/grokIcon"; // أيقونة Grok المخصصة التي أرسلتها سابقاً

const PostComposer = () => {
  const theme = useTheme();
  const [postText, setPostText] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [file, setFile] = useState(null); // لتخزين الملف لإرساله
  const [preview, setPreview] = useState(null); // لعرض الصوره في الصفحه بمجرد تحميلها
  const [isPosting, setIsPosting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null); // لعرض رسالة خطأ بدلاً من alert

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    setFile(file);
    setLoadingPreview(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      // 4. تعيين المسار المؤقت (Data URL) كقيمة للمعاينة
      setPreview(reader.result);
      setLoadingPreview(false);
    };
    reader.onerror = () => {
      // 5. التعامل مع الخطأ (إذا فشلت القراءة)
      console.error("FileReader failed to read the file.");
      setLoadingPreview(false);
      // يمكنك إضافة رسالة خطأ للمستخدم هنا
    };
    // 6. ⭐️ قراءة الملف كـ Data URL
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
  };
  // function to upload image to cloudinary and preview it in page from react
  // const handleImage = async (e) => {
  //   const image = e.target.files[0];
  //   if (!image) {
  //     return;
  //   }
  //   setLoadingPreview(true);
  //   //send image to cloudinary and preview it
  //   const formData = new FormData();
  //   formData.append("file", image);
  //   formData.append("upload_preset", "posts-unsigned"); // preset name in cloudinary
  //   formData.append("folder", "socialmediaApp/posts");
  //   try {
  //     const response = await fetch(
  //       "https://api.cloudinary.com/v1_1/ditaxyrbs/image/upload",
  //       {
  //         method: "POST",
  //         body: formData,
  //       }
  //     );
  //     const data = await response.json();
  //     setPreview(data.secure_url);
  //   } catch (error) {
  //     console.log(error);
  //     alert("upload failed");
  //   } finally {
  //     setLoadingPreview(false);
  //   }
  // };

  //function to send post to mongoo database
  const handlePost = async () => {
    setErrorMessage(null);
    if (!postText.trim() && !file) {
      setErrorMessage("Please enter text or select an image to post.");
      return;
    }

    setIsPosting(true);
    const formData = new FormData();
    formData.append("text", postText.trim()); // إضافة النص

    if (file) {
      formData.append("image", file);
    }

    try {
      const response = await fetch(`http://localhost:3000/api/posts`, {
        method: "POST",
        body: formData,
        // credentials:"include"
      });
      if (!response) {
        console.log("no data");
      }
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Post creation failed:", errorData);
        setErrorMessage(
          errorData.message ||
            `Post creation failed with status: ${response.status}`
        );
        return;
      }
      const data = await response.json();
      console.log("Post created successfully", data);
      setPostText("");
      setFile(null);
      setPreview(null);
      setErrorMessage("Post uploaded successfully!");
    } catch (error) {
      console.error("Network or fetch error:", error);
      setErrorMessage("Failed to connect to the server.");
    } finally {
      setIsPosting(false);
    }
  };
  // تحديد ما إذا كان زر النشر نشطاً
  const isPostButtonEnabled = postText.trim().length > 0 || !!file;
  return (
    <Box
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        width: "100%",
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* 2. منطقة كتابة المنشور */}
      <Box sx={{ p: 2, display: "flex", gap: 1 }}>
        {/* صورة المستخدم (Avatar) */}
        <Avatar
          alt="User"
          src="" // استبدلها بمسار صورة المستخدم الفعلي
          sx={{ width: 48, height: 48, mt: 1 }}
        />

        <Box sx={{ flexGrow: 1 }}>
          {/* حقل الإدخال (Text Area) */}
          <InputBase
            placeholder="What's happening?"
            fullWidth
            multiline
            rows={3}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            sx={{
              fontSize: "20px",
              py: 1.5,
              color: theme.palette.text.primary,
            }}
          />
          {/* ⭐️ منطقة معاينة الصورة */}
          {preview && (
            <Box
              sx={{
                my: 1,
                position: "relative",
                maxWidth: "400px",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              {loadingPreview ? (
                <Box color={theme.palette.text.primary}>
                  Loading image preview...
                </Box>
              ) : (
                <>
                  <img
                    src={preview}
                    alt="Post Preview"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                  {/* زر إزالة الصورة */}
                  <IconButton
                    onClick={handleRemoveImage}
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      bgcolor: "rgba(0, 0, 0, 0.6)",
                      color: "white",
                      "&:hover": { bgcolor: "rgba(0, 0, 0, 0.8)" },
                    }}
                  >
                    X
                  </IconButton>
                </>
              )}
            </Box>
          )}
          {/* أيقونة Grok / AI */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <GrokIcon
              size={20}
              color={
                theme.palette.mode == "dark"
                  ? theme.palette.text.secondary
                  : theme.palette.primary.main
              }
            />
          </Box>

          {/* زر تحديد الجمهور (Everyone can reply) */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Public
              sx={{
                fontSize: "16px",
                color:
                  theme.palette.mode == "dark"
                    ? theme.palette.text.secondary
                    : theme.palette.primary.main,
                mr: 0.5,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color:
                  theme.palette.mode == "dark"
                    ? theme.palette.text.secondary
                    : theme.palette.primary.main,
                fontWeight: "bold",
              }}
            >
              Everyone can reply
            </Typography>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* 3. أزرار الوسائط وزر النشر */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* أيقونات الوسائط */}
            <Box>
              <IconButton
                component="label"
                sx={{
                  color:
                    theme.palette.mode == "dark"
                      ? theme.palette.text.secondary
                      : theme.palette.primary.main,
                }}
                aria-label="upload picture"
              >
                <ImageOutlined />

                <input
                  onChange={(e) => {
                    handleImage(e);
                  }}
                  type="file"
                  style={{ display: "none" }}
                  multiple
                />
              </IconButton>
              <IconButton>
                <GifBoxOutlined
                  sx={{
                    fontSize: 20,
                    color:
                      theme.palette.mode == "dark"
                        ? theme.palette.text.secondary
                        : theme.palette.primary.main,
                  }}
                />
              </IconButton>
              <IconButton>
                <FormatListBulletedOutlined
                  sx={{
                    fontSize: 20,
                    color:
                      theme.palette.mode == "dark"
                        ? theme.palette.text.secondary
                        : theme.palette.primary.main,
                  }}
                />
              </IconButton>
              <IconButton>
                <SentimentSatisfiedOutlined
                  sx={{
                    fontSize: 20,
                    color:
                      theme.palette.mode == "dark"
                        ? theme.palette.text.secondary
                        : theme.palette.primary.main,
                  }}
                />
              </IconButton>
              <IconButton>
                <CalendarTodayOutlined
                  sx={{
                    fontSize: 20,
                    color:
                      theme.palette.mode == "dark"
                        ? theme.palette.text.secondary
                        : theme.palette.primary.main,
                  }}
                />
              </IconButton>
              <IconButton>
                <LocationOnOutlined
                  sx={{
                    fontSize: 20,
                    color:
                      theme.palette.mode == "dark"
                        ? theme.palette.text.secondary
                        : theme.palette.primary.main,
                  }}
                />
              </IconButton>
            </Box>

            {/* زر Post */}
            <Button
              variant="contained"
              onClick={handlePost}
              // ⭐️ تم تعديل شرط التعطيل ليشمل النص أو وجود ملف
              disabled={!isPostButtonEnabled || isPosting}
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: "20px",
                minWidth: "80px",
                padding: "8px 16px",
              }}
            >
              {isPosting ? "Posting..." : "Post"}
            </Button>
          </Box>
          {/* رسائل الخطأ/النجاح */}
          {errorMessage && (
            <Typography
              variant="body2"
              sx={{
                color: errorMessage.includes("success")
                  ? theme.palette.success.main
                  : theme.palette.error.main,
                mt: 1,
              }}
            >
              {errorMessage}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PostComposer;
