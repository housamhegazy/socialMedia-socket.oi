import {
  Box,
  Avatar,
  InputBase,
  Typography,
  Divider,
  Button,
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
import GrokIcon from "../../components/grokIcon"; // أيقونة Grok المخصصة التي أرسلتها سابقاً
import { useState } from "react";
import {
  useCreatePostMutation,
} from "../../Api/posts/postsApi";
const PostComposer = ({ user }) => {
  const theme = useTheme();
  const [createPost, { isLoading, isError, error }] = useCreatePostMutation();
  //store data of post states
  const [postText, setPostText] = useState(""); // post text
  const [loadingPreview, setLoadingPreview] = useState(false); // loading preview box
  const [file, setFile] = useState(null); // save image to send to db
  const [preview, setPreview] = useState(null); // save image in preview in page
  const [Message, setMessage] = useState(null); // error message
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

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
  //==============================send posts to database=========================================================
  const handlePost = async () => {
    setMessage(null);
    if (!postText.trim() && !file) {
      setMessage("Please enter text or select an image to post.");
      return;
    }
    const formData = new FormData();
    formData.append("text", postText.trim()); // إضافة النص

    if (file) {
      formData.append("image", file);
    }
    try {
      await createPost(formData).unwrap(); // unwrap لتعامل أفضل مع الأخطاء
      setFile(null);
      setPreview(null);
      setStatus("success");
      setMessage("Post uploaded successfully!");
      // refetch(); // إعادة تحميل البوستات
    } catch (error) {
      setStatus("error");
      setMessage("Failed to connect to the server.");
    }
  };

  //==========================================remove preview====================================
  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
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
          src={user?.avatar}
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
            <GrokIcon />
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
              disabled={!isPostButtonEnabled || isLoading}
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: "20px",
                minWidth: "80px",
                padding: "8px 16px",
              }}
            >
              {isLoading ? "Posting..." : "Post"}
            </Button>
          </Box>
          {/* رسائل الخطأ/النجاح */}
          {Message && (
            <Typography
              variant="body2"
              sx={{
                color:
                  status === "success"
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                mt: 1,
              }}
            >
              {Message}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PostComposer;
