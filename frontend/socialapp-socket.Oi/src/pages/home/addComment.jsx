import { ImageOutlined } from "@mui/icons-material";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Button,
  useTheme,
} from "@mui/material";
import {
  useCreateCommentMutation,
  useGetPostCommentsQuery,
} from "../../Api/comments/commentsApi";
import { useState } from "react";

const AddComment = ({ post, user }) => {
  const theme = useTheme();
  const [visibleCount, setVisibleCount] = useState(3); // view 3comments
  const [viewCommentBox, setViewCommentBox] = useState(false);
  
  //===================create post ===========================
  const [createComment, { isLoading, isError, Error }] =
    useCreateCommentMutation();
  //==================== comments ===================================
  const { data: comments = [], isLoading: loadingComments } =
    useGetPostCommentsQuery(post?._id, {
      skip: !post?._id,
    });
  //================== comment state ==================================
  const [text, setText] = useState("");

  //================================ send comment ==============================
  const handleSendComment = async () => {
    const postId = post?._id;
    try {
      const response = await createComment({ postId, text }).unwrap();
      setText("");
      console.log("comment added successfully", response);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Box>
      {/* زر فتح صندوق كتابة الكومنتات  */}
      {!viewCommentBox && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            onClick={() => setViewCommentBox(true)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "15px",
              color: "text.secondary",
              borderRadius: "20px",
              px: 2.5,
              py: 0.5,

              // تأثير Hover
              transition: "0.25s ease",
              "&:hover": {
                color: "rgba(212, 221, 230, 0.82)",
                backgroundColor: "rgba(25,118,210,0.08)", // لون خفيف زي الفيسبوك
                boxShadow: "0px 0px 6px rgba(0,0,0,0.1)",
              },
            }}
          >
            Write Comment
          </Button>
        </Box>
      )}

      <Box sx={{ ml: 2 }}>{
         comments?.length === 1
          ? comments?.length + " comment"
          : comments.length + " comments"}{" "}
      </Box>
      {viewCommentBox && (
        <Box sx={{ display: "flex", gap: 2, width: "100%", mt: 2, px: 1 }}>
          {/* Avatar */}
          <Avatar
            src={user.avatar}
            alt="avatar"
            sx={{ width: 42, height: 42 }}
          />

          <Box sx={{ flex: 1 }}>
            {/* شريط الرد */}
            <Box
              sx={{
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {/* يظهر فقط عند الرد */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "primary.light",
                  color: "primary.dark",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "20px",
                  fontSize: "14px",
                }}
              >
                <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                  Reply to {post?.owner?.name}
                </Typography>

                <IconButton
                  onClick={() => {
                    setViewCommentBox(false);
                  }}
                  size="small"
                  sx={{ p: 0.5 }}
                >
                  ✕
                </IconButton>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1, // مسافة بسيطة بين الكومنت والزر
                mb: 1,
              }}
            >
              {/* مربع كتابة الكومنت */}
              <TextField
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
                multiline
                minRows={1}
                maxRows={4}
                value={text}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                    padding: "6px 14px",
                    fontSize: "14px",
                  },
                }}
              />

              {/* زر إرسال جنب الكومنت */}
              <Button
                onClick={handleSendComment}
                variant="contained"
                sx={{
                  borderRadius: "10px",
                  px: 2.5,
                  py: "8px",
                  textTransform: "none",
                  fontWeight: "bold",
                  height: "100%", // يملى الارتفاع لو عايز
                  alignSelf: "flex-end", // نزلو تحت لو multiline عالي
                }}
              >
                Send
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      <Box>
        {/* =================== عرض الكومنتات =================== */}
        <Box sx={{ mt: 3 }}>
          {/* لو في تحميل */}
          {loadingComments && (
            <Typography sx={{ textAlign: "center", color: "gray" }}>
              Loading comments...
            </Typography>
          )}

          {/* لو مفيش كومنتات */}
          {!loadingComments && comments?.length === 0 && (
            <Typography sx={{ color: "gray", fontSize: "14px" }}>
              No comments yet.
            </Typography>
          )}

          {/* عرض كل الكومنتات */}
          {/* Comments list */}
          {/*  view only 3 comments  */}
          {comments?.slice(0, visibleCount).map((c) => (
            <Box
              key={c._id}
              sx={{
                display: "flex",
                gap: 2,
                mb: 1,
                p: 1.8,
                borderRadius: "12px",
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.default,
                transition: "0.2s",
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              {/* Avatar */}
              <Avatar
                src={c.owner?.avatar}
                alt={c.owner?.name}
                sx={{ width: 36, height: 36 }}
              />

              <Box sx={{ flex: 1 }}>
                {/* Name */}
                <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
                  {c.owner?.name}
                </Typography>

                {/* Text */}
                <Typography sx={{ fontSize: "14px", mt: 0.3 }}>
                  {c.text}
                </Typography>

                {/* Reply button */}
                <Typography
                  sx={{
                    fontSize: "13px",
                    mt: 0.8,
                    color: "inherit",
                    cursor: "pointer",
                    fontWeight: 500,
                    "&:hover": { textDecoration: "underline" },
                  }}
                  onClick={() => console.log("reply to comment:", c._id)}
                >
                  Reply
                </Typography>

                {/* Replies (لو عايز تعرضهم بعدين) */}
                {c.replies?.length > 0 && (
                  <Box sx={{ mt: 1.5, ml: 4 }}>
                    {c.replies.map((r) => (
                      <Box
                        key={r._id}
                        sx={{
                          p: 1,
                          mb: 1,
                          borderRadius: "10px",
                          backgroundColor: theme.palette.action.hover,
                        }}
                      >
                        <Typography
                          sx={{ fontWeight: "bold", fontSize: "13px" }}
                        >
                          {r.owner?.name}
                        </Typography>
                        <Typography sx={{ fontSize: "13px" }}>
                          {r.text}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          ))}
          {/* لاظهار باقي الكومنتات */}
          {visibleCount < comments.length && (
            <Button
              onClick={() => setVisibleCount((prev) => prev + 3)}
              sx={{
                mt: 1,
                textTransform: "none",
                fontWeight: "bold",
                color: "inherit",
              }}
            >
              View more
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AddComment;
