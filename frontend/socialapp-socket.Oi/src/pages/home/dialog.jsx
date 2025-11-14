import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Avatar,
  IconButton,
  useTheme,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEditPostMutation } from "../../Api/posts/postsApi";
import { useState } from "react";
import {
  Public,
  ImageOutlined,
  GifBoxOutlined,
  FormatListBulletedOutlined,
  SentimentSatisfiedOutlined,
  CalendarTodayOutlined,
  LocationOnOutlined,
} from "@mui/icons-material";
import GrokIcon from "../../components/grokIcon";

const DialogComp = ({ post, setOpenDialog }) => {
  const theme = useTheme();
  const [editPost, { isLoading: updating }] = useEditPostMutation();

  // ===========================================sort image in state =================================
  const [postText, setPostText] = useState(post?.text || "");
  const [preview, setPreview] = useState(post.image || "");
  const [imgFile, setImgFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false); // ببعت للباك اند لو المستخدم حذف الصوره ترو عشان يحذفها من الداتابيز مع التحديث 

  //============================= handle image to preview ==================================
  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    setImgFile(file);
    setRemoveImage(false); 
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.onerror = () => {
      console.error("FileReader failed to read the file.");
    };
    reader.readAsDataURL(file);
  };

  // ===========================================
  // ❌ حذف الصورة الحالية (سواء قديمة أو جديدة)
  // ===========================================
  const handleRemoveImage = () => {
    setImgFile(null);
    setPreview(null);
    setRemoveImage(true);
    console.log("user deleted photo", removeImage);
  };
console.log(removeImage);
  //============================== handle edite =================================
  const handleEdit = async () => {
    const postId = post._id;
    if (!postText.trim() && !imgFile) {
      return;
    }
    const formData = new FormData();
    formData.append("text", postText.trim()); // إضافة النص

    // لو في صورة جديدة (فايل فعلي)
    if (imgFile && typeof imgFile !== "string") {
      formData.append("image", imgFile);
    }
    // لو المستخدم حذف الصورة القديمة
    if (removeImage) {
      formData.append("removeImage", "true");
    }

    try {
      await editPost({ postId, formData });
      console.log("updated");
      setOpenDialog(false);
    } catch (error) {
      console.log(error);
    }
  };
  //==========================================remove preview====================================

  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "16px",
          padding: 2,
        },
      }}
    >
      {/* رأس النافذة */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          Edit Post
        </Typography>
        <IconButton
          onClick={() => {
            setOpenDialog(false);
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* المحتوى */}
      <DialogContent
        dividers
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {/* صورة المستخدم */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            alt="User"
            src={post?.owner.avatar}
            sx={{ width: 40, height: 40 }}
          />
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {post?.owner.name}
          </Typography>
        </Box>

        {/* حقل النص */}
        {/* حقل النص */}
        <TextField
          onChange={(e) => {
            setPostText(e.target.value);
          }}
          fullWidth
          multiline
          rows={3}
          placeholder="Edit your post..."
          variant="outlined"
          value={postText}
        />
        {/* معاينة الصورة */}
        <Box
          sx={{
            position: "relative",
            borderRadius: "12px",
            overflow: "hidden",
            maxWidth: "100%",
          }}
        >
          <img
            src={preview}
            alt="Preview"
            style={{ width: "100%", display: "block" }}
          />
          <IconButton
          onClick={()=>{
            handleRemoveImage()
          }}
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              bgcolor: "rgba(0,0,0,0.6)",
              color: "white",
              "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
            }}
          >
            X
          </IconButton>
        </Box>

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
        </Box>
      </DialogContent>

      {/* الأزرار */}
      <DialogActions sx={{ justifyContent: "space-between", px: 3 }}>
        <Button variant="outlined">Cancel</Button>
        <Button
          onClick={() => {
            handleEdit();
          }}
          variant="contained"
          sx={{ borderRadius: "20px" }}
        >
        {updating ? "loading" : "Update"}
          
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogComp;
