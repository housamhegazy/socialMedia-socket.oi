import { useGetOnePostQuery } from "../../Api/posts/postsApi";
import { useRef, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  MoreVert,
  Favorite,
  Share,
  Delete,
  DeleteForever,
  PersonAdd,
  Comment,
} from "@mui/icons-material";
import {
  Card,
  CardHeader,
  Avatar,
  IconButton,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  useTheme,
  Box,
  ListItemIcon,
  Menu,
  MenuItem,
  Dialog,
} from "@mui/material";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  useDeletePostMutation,
  useLikePostMutation,
} from "../../Api/posts/postsApi";
import Swal from "sweetalert2";
import { useGetUserByNameQuery } from "../../Api/user/userApi";
import { formatDistance } from "date-fns";
import { useState } from "react";
import AddComment from "../home/addComment";
const PostDetails = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { postId } = useParams();
  //========================get one post
  const { data: post, isLoading: isFetching } = useGetOnePostQuery(postId);

  // @ts-ignore
  const { user } = useSelector((state) => state.auth);
  const { refetch } = useGetUserByNameQuery();
  const [deletePost, { isLoading, isError, error }] = useDeletePostMutation();
  //=================== add likes =========================================
  const [likePost] = useLikePostMutation();
  //===================== edite dialog =================================
  const [openLikesDialog, setOpenLikesDialog] = useState(false);
  const [postDialog, setPostDialog] = useState(false);
  const [zoom, setZoom] = useState(1);
  const commentIdToHighlight = searchParams.get("comment");
  const commentRefs = useRef({});

  useEffect(() => {
    if (commentIdToHighlight && commentRefs.current[commentIdToHighlight]) {
      commentRefs.current[commentIdToHighlight].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      // 💡 إزالة الـ Query Parameter بعد التمرير
      // نستخدم setTimeout لإتاحة الوقت للتمرير
      const timer = setTimeout(() => {
        setSearchParams({}, { replace: true });
      }, 1500);

      return () => clearTimeout(timer); // تنظيف المؤقت عند إزالة المكون
    }
  }, [
    commentIdToHighlight,
    setSearchParams /* 💡 يجب إضافة setSearchParams هنا */,
  ]);
  //=================================== card functions =========================================================

  //=================== menu functions ============================
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  //======================= open comment box =============================
  const [openCommentBox, setOpenCommentBox] = useState(false);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteMenu = (postId) => {
    handleClose();
    handleDelete(postId);
  };
  //=============================================================================
  const handleDelete = async (postId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        await deletePost(postId).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        await refetch(); // ✅ تحديث البوستات بعد الحذف مباشرة
      } catch (error) {
        console.error("Delete failed:", error);
        Swal.fire({
          title: "Error!",
          text:
            error?.data?.message ||
            "Something went wrong while deleting the post.",
          icon: "error",
        });
      }
    }
  };
  //============================================handle share =================================
  const handleShare = (post) => {
    if (navigator.share) {
      navigator
        .share({
          title: post?.owner?.name || "Post",
          text: post?.text || "",
          url: window.location.origin + "/posts/" + post._id,
        })
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.log("Error sharing:", error));
    } else {
      // Fallback للمتصفحات اللي مبتدعمش Web Share API
      navigator.clipboard.writeText(
        window.location.origin + "/post/" + post._id
      );
      Swal.fire({
        icon: "success",
        title: "Link copied!",
        text: "Post link copied to clipboard.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  // 3. عرض حالة التحميل (ضروري)
  if (isLoading || isFetching) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Typography>Loading Post...</Typography>
        {/* يمكنك إضافة مكون تحميل هنا مثل CircularProgress */}
      </Box>
    );
  }

  // 4. عرض حالة الخطأ
  if (isError || !post) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Typography color="error">
          Post not found or an error occurred.
        </Typography>
      </Box>
    );
  }
  return (
    <Box>
      <Card
        sx={{
          // id: post?._id,
          Width: "100%",
          margin: "10px auto",
          my: 5,
          borderRadius: "20px",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              onClick={() => {
                navigate(`/user/${post?.owner?.username}`);
              }}
              sx={{ bgcolor: "#d93526", cursor: "pointer" }}
              aria-label="recipe"
              src={post?.owner?.avatar}
            >
              {!post?.owner?.avatar &&
                post?.owner?.username?.[0]?.toUpperCase()}
            </Avatar>
          }
          //========================================= menu ================================================================================
          action={
            <Box style={{ display: "flex", justifyContent: "flex-end" }}>
              <>
                <IconButton
                  aria-label="settings"
                  onClick={handleClick}
                  sx={{
                    color: "text.secondary",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                  }}
                >
                  <MoreVert />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  disableScrollLock={true}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 180,
                      borderRadius: 2,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  {post?.owner._id == user._id ? (
                    <Box>
                      <MenuItem
                        onClick={() => {
                          handleDeleteMenu(post?._id);
                        }}
                        sx={{ color: "error.main" }}
                      >
                        <ListItemIcon>
                          <DeleteForever fontSize="small" color="error" />
                        </ListItemIcon>
                        <Typography variant="body2">delete </Typography>
                      </MenuItem>
                      <MenuItem sx={{ color: "inherit" }}>
                        <ListItemIcon>
                          <DeleteForever fontSize="small" color="inherit" />
                        </ListItemIcon>
                        <Typography variant="body2"> Edit </Typography>
                      </MenuItem>
                    </Box>
                  ) : (
                    <MenuItem sx={{ color: "text.main" }}>
                      <ListItemIcon>
                        <PersonAdd fontSize="small" color="inherit" />
                      </ListItemIcon>
                      <Typography variant="body2">follow</Typography>
                    </MenuItem>
                  )}
                </Menu>
              </>
            </Box>
          }
          //======================================= end menu ==========================================================
          title={post?.owner?.name}
          subheader={formatDistance(new Date(post?.createdAt), new Date())}
        />
        {post?.image && (
          <CardMedia
            onClick={() => {
              setPostDialog(true);
            }}
            component="img"
            height="194"
            image={post?.image}
            alt="Paella dish"
            loading="lazy"
          />
        )}

        <CardContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {post?.text}
          </Typography>
        </CardContent>
        <CardActions
          disableSpacing
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <IconButton
              onClick={async () => {
                likePost(post._id).unwrap();
              }}
              aria-label="likes"
            >
              <Favorite
                color={
                  post.likes.some(
                    (like) => String(like._id) === String(user._id)
                  )
                    ? "error"
                    : "inherit"
                }
              />
            </IconButton>

            {/* Likes Summary (Instagram-like style) and open dialog */}
            <Box sx={{ px: 1, mt: 0.5 }}>
              {post.likes.length > 0 && (
                <Typography
                  onClick={() => setOpenLikesDialog(true)}
                  sx={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    "&:hover": { opacity: 0.7 },
                  }}
                >
                  Liked by{" "}
                  <span style={{ color: "#555" }}>
                    {post.likes.length === 1
                      ? "1 person"
                      : `${post.likes.length} people`}
                  </span>
                </Typography>
              )}
            </Box>
            {/*================================================= likes dialog =================================== */}
            <Dialog
              open={openLikesDialog}
              onClose={() => setOpenLikesDialog(false)}
              fullWidth
              maxWidth="sm"
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                  Likes
                </Typography>

                {post.likes.length === 0 ? (
                  <Typography sx={{ textAlign: "center", py: 3 }}>
                    No likes yet
                  </Typography>
                ) : (
                  post.likes.map((like) => (
                    <Box
                      key={like._id || like}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1,
                        borderRadius: "10px",
                        cursor: "pointer",
                        "&:hover": { background: "rgba(0,0,0,0.04)" },
                      }}
                      onClick={() => navigate(`/user/${like.username}`)}
                    >
                      <Avatar src={like.avatar} alt={like.name} sx={{ mr: 2 }}>
                        {!like.avatar && like.name?.charAt(0)?.toUpperCase()}
                      </Avatar>

                      <Typography sx={{ fontWeight: "500" }}>
                        {like.name || "User"}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </Dialog>
            {/* ============================================ end dialog ====================================== */}
            {/* ============================================ post dialog ======================================= */}
            {postDialog && (
              <Dialog
                onClick={(e) => e.stopPropagation()} // ⭐️ نوقف الانتشار هنا ⭐️
                open={postDialog}
                onClose={() => {
                  setPostDialog(false);
                  setZoom(1);
                }}
                // fullWidth
                maxWidth="md"
                PaperProps={{
                  sx: {
                    maxWidth: "90%", // عرض أقصى 90% من الشاشة
                    width: "auto", // عرض تلقائي بناءً على المحتوى
                    maxHeight: "90vh", // ارتفاع أقصى 90% من ارتفاع الشاشة
                    borderRadius: "12px",
                  },
                }}
                scroll="body"
              >
                <Box
                  sx={{
                    p: 1,
                    overflow: "auto",
                    cursor: "zoom-in",
                    maxHeight: "85vh",
                  }}
                  onWheel={(e) => {
                    setZoom((prev) => {
                      let newZoom = prev + (e.deltaY < 0 ? 0.1 : -0.1);
                      if (newZoom < 1) newZoom = 1; // أقل زوم
                      if (newZoom > 4) newZoom = 4; // أعلى زوم
                      return newZoom;
                    });
                  }}
                >
                  <img
                    src={post.image}
                    alt="Post"
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "10px",
                      transform: `scale(${zoom})`,
                      transformOrigin: "center center",
                      transition: "transform 0.15s ease-out",
                      cursor: zoom > 1 ? "zoom-out" : "zoom-in",
                    }}
                  />
                </Box>
              </Dialog>
            )}
            {/* ==================================== end post dialog ================================== */}
          </Box>
          <IconButton
            onClick={() => {
              setOpenCommentBox(true);
            }}
          >
            <Comment />
          </IconButton>
          <IconButton onClick={() => handleShare(post)} aria-label="share">
            <Share />
          </IconButton>
        </CardActions>
        {isError && (
          <Typography
            variant="body2"
            sx={{ color: theme.palette.error.main, textAlign: "center", mt: 1 }}
          >
            {// @ts-ignore
            error?.data?.message || "Failed to delete post."}
          </Typography>
        )}
        <AddComment
          post={post}
          user={user}
          openCommentBox={openCommentBox}
          setOpenCommentBox={setOpenCommentBox}
          commentIdToHighlight={commentIdToHighlight}
          commentRefs={commentRefs}
        />
      </Card>
    </Box>
  );
};

export default PostDetails;
