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
  useCreateReplyMutation,
  useGetPostCommentsQuery,
} from "../../Api/comments/commentsApi";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { formatDistance } from "date-fns";

const AddComment = ({
  post,
  user,
  openCommentBox,
  setOpenCommentBox,
  commentRefs,
  commentIdToHighlight,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  //===================create post ===========================
  const [createComment, { isLoading, isError, Error }] =
    useCreateCommentMutation();
  //================= create reply ==========================
  const [createReply] = useCreateReplyMutation();
  //==================== comments ===================================
  const { data: comments = [], isLoading: loadingComments } =
    useGetPostCommentsQuery(post?._id, {
      skip: !post?._id,
    });
  //================== comment state ==================================
  const [text, setText] = useState("");
  const [visibleCount, setVisibleCount] = useState(3); // view 3comments
  //====================Reply state ===================================
  const [replyText, setreplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
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

  //================================== send reply ====================================
  const handleSendreply = async (commentId) => {
    try {
      await createReply({ commentId, replyText }).unwrap();
      setreplyText("");
    } catch (error) {
      console.log(error);
    }
  };

  // 💡 إضافة useEffect لمعالجة التوجيه من الإشعار
  useEffect(() => {
    // 1. التحقق مما إذا كان هناك مُعرِّف تعليق للتسليط عليه
    if (commentIdToHighlight) {
      // 2. البحث عن فهرس (Index) التعليق المستهدف في القائمة الكاملة
      const targetIndex = comments.findIndex(
        (c) => c._id === commentIdToHighlight
      ); // 3. إذا وُجد التعليق وكان فهرسه أكبر من أو يساوي عدد التعليقات المعروضة حالياً
      if (targetIndex !== -1 && targetIndex >= visibleCount) {
        // قم بزيادة visibleCount لتشمل التعليق المستهدف (targetIndex + 1)
        // يمكنك زيادة العدد لـ (الفهرس + 1) أو (الفهرس + 3) لضمان ظهور بعض التعليقات التي تليه
        const newVisibleCount = targetIndex + 1; // 4. قم بتحديث الحالة لضمان ظهور التعليق المستهدف
        setVisibleCount(newVisibleCount);
      }

      // 5. فتح مربع التعليق (OpenCommentBox) إذا كان مغلقًا لضمان رؤية التعليق بسهولة
      if (!openCommentBox) {
        setOpenCommentBox(true);
      }
    } // نضيف جميع الاعتماديات التي قد تتغير هنا
  }, [
    commentIdToHighlight,
    comments,
    visibleCount,
    openCommentBox,
    setOpenCommentBox,
  ]);

  // ...
  return (
    <Box>
      <Box sx={{ ml: 2 }}>
        {comments?.length === 1
          ? comments?.length + " comment"
          : comments.length + " comments"}{" "}
      </Box>
      {/*==================================================== comment box ====================================================== */}
      {openCommentBox && (
        <Box sx={{ display: "flex", gap: 2, width: "100%", mt: 2, px: 1 }}>
          {/* Avatar */}
          <Avatar
            src={user.avatar}
            alt="avatar"
            sx={{ width: 42, height: 42 }}
            onClick={() => navigate(`/user/${user?.username}`)}
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
                    setOpenCommentBox(false);
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
        {/* ================================================================  comments ================================================== */}
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
              ref={(el) => (commentRefs.current[c._id] = el)}
              sx={{
                display: "flex",
                gap: 2,
                // mb: 1,
                p: 1.8,
                borderRadius: "12px",
                transition: "background-color 0.3s",
                // تسليط الضوء المؤقت
                backgroundColor:
                  commentIdToHighlight === c._id
                    ? "rgba(255, 165, 0, 0.2)"
                    : "transparent",
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              {/* Avatar */}
              <Avatar
                src={c.owner?.avatar}
                alt={c.owner?.name}
                sx={{ width: 36, height: 36, cursor: "pointer" }}
                onClick={() => navigate(`/user/${c.owner?.username}`)}
              />

              <Box sx={{ flex: 1 }}>
                {/* Name */}
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
                    {c.owner?.name}
                  </Typography>
                  <span
                    style={{
                      fontSize: "10px",
                      marginLeft: "5px",
                      opacity: 0.5,
                    }}
                  >
                    {formatDistance(new Date(c?.createdAt), new Date())}
                  </span>
                </Box>

                {/* Text */}
                <Typography sx={{ fontSize: "14px", mt: 0.3 }}>
                  {c.text}
                </Typography>
                {/* ============================================ reply box ============================================= */}

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
                  onClick={() => {
                    setActiveReplyId(c._id); // افتح بس الرد الخاص بالكومنت ده
                  }}
                >
                  Reply
                </Typography>
                {activeReplyId === c._id && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      width: "100%",
                      mt: 2,
                      px: 1,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      {/* شريط الرد */}
                      <Box
                        sx={{
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      ></Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1, // مسافة بسيطة بين الكومنت والزر
                          mb: 1,
                        }}
                      >
                        {/* مربع كتابة الرد */}
                        <TextField
                          onChange={(e) => setreplyText(e.target.value)}
                          placeholder={`Reply to ${c?.owner?.name}`}
                          multiline
                          minRows={1}
                          maxRows={4}
                          value={replyText}
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "20px",
                              padding: "6px 14px",
                              fontSize: "14px",
                            },
                          }}
                        />
                        <IconButton
                          onClick={() => {
                            setActiveReplyId(null);
                          }}
                          size="small"
                          sx={{ p: 0.1 }}
                        >
                          ✕
                        </IconButton>
                        {/* زر إرسال جنب الرد */}
                        <Button
                          onClick={() => {
                            handleSendreply(c._id);
                          }}
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
                {/*==================================================== Replys ====================================================== */}
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
                          display: "flex",
                          flexDirection: "column",
                          // alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <Avatar
                            src={r.owner?.avatar}
                            alt={r.owner?.name}
                            sx={{
                              width: 25,
                              height: 25,
                              mr: 1,
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              navigate(`/user/${r.owner?.username}`)
                            }
                          />
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              sx={{ fontWeight: "bold", fontSize: "13px" }}
                            >
                              {r.owner?.name}
                            </Typography>
                            <span
                              style={{
                                fontSize: "10px",
                                marginLeft: "5px",
                                opacity: 0.5,
                              }}
                            >
                              {formatDistance(
                                new Date(c?.createdAt),
                                new Date()
                              )}
                            </span>
                          </Box>
                        </Box>
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
          {/*==================================================== end replay box ====================================================== */}
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
