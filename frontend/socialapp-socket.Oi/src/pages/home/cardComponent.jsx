import {
  MoreVert,
  Favorite,
  Share,
  DeleteForever,
  PersonAdd,
  Comment,
  LocationOn,
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
import { useEffect, useState } from "react";
import DialogComp from "./dialog";
import AddComment from "./addComment";
const CardComponent = ({ post, isMyProfile }) => {
  const [isLikedLocally, setIsLikedLocally] = useState(false);
  // @ts-ignore
  const { user } = useSelector((state) => state.auth);
  const { refetch } = useGetUserByNameQuery();
  const [deletePost, { isError, error }] = useDeletePostMutation();
  //=================== add likes =========================================
  const [likePost] = useLikePostMutation();
  //===================== edite dialog =================================
  const [openDialog, setOpenDialog] = useState(false);
  const [openLikesDialog, setOpenLikesDialog] = useState(false);
  const [postDialog, setPostDialog] = useState(false);
  const [zoom, setZoom] = useState(1);

  const theme = useTheme();
  const navigate = useNavigate();

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
  //================================= open dialoge ==========================
  const openDialogFunc = () => {
    setOpenDialog(true);
    setAnchorEl(null);
  };
  //=============================================================================
  //================================ useEffect for likes state =================================
  useEffect(() => {
    // التحقق مما إذا كان المستخدم الحالي ضمن قائمة الإعجابات
    const userHasLiked = post.likes.some(
      (like) => String(like._id) === String(user._id)
    );
    setIsLikedLocally(userHasLiked);
  }, [post.likes, user._id]); // يتم التنفيذ عند تغيير الإعجابات أو بيانات المستخدم

  const handleLikeClick = async () => {
    // 🚀 Optimistic Update: قم بتغيير الحالة المحلية فوراً
    setIsLikedLocally((prev) => !prev);

    try {
      // أرسل طلب الـ API في الخلفية
      await likePost(post._id).unwrap();
      // هنا، RTK Query سيهتم بتحديث الكاش والـ UI بعد نجاح الطلب،
      // ولكن الـ UI سيتغير بالفعل بسبب `isLikedLocally`
    } catch (error) {
      // ❌ Revert: في حالة فشل طلب الباك إند، رجّع الحالة المحلية مرة أخرى
      setIsLikedLocally((prev) => !prev);
      console.error("Like/Unlike failed:", error);
      // قد ترغب في إظهار رسالة خطأ هنا
    }
  };
  //=============================================================
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
  return (
    <Box>
      {openDialog && <DialogComp {...{ post, setOpenDialog }} />}

      <Card
        sx={{
          id: post._id,
          maxWidth: "100%",
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
              src={isMyProfile ? user.avatar : post.owner?.avatar}
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
                      minWidth: 60,
                      borderRadius: 2,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  {isMyProfile || post.owner._id == user._id ? (
                    <Box>
                      <MenuItem
                        onClick={() => {
                          handleDeleteMenu(post._id);
                        }}
                        sx={{ color: "error.main" }}
                      >
                        <ListItemIcon>
                          <DeleteForever fontSize="small" color="error" />
                        </ListItemIcon>
                        <Typography variant="body2">delete </Typography>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          openDialogFunc();
                        }}
                        sx={{ color: "inherit" }}
                      >
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
          subheader={formatDistance(new Date(post.createdAt), new Date())}
        />
        {post.image && (
          <CardMedia
            onClick={() => {
              setPostDialog(true);
            }}
            component="img"
            height="194"
            image={post?.image}
            alt="Paella dish"
            loading="lazy"
            sx={{ cursor: "pointer" }}
          />
        )}

        <CardContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {post.text}
          </Typography>
          {post?.location ? (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                display: "flex",
                alignItems: "center",
                mt: 5,
              }}
            >
              <LocationOn sx={{ mr: 0.5 }} />
              {post.location?.city}
            </Typography>
          ) : null}
        </CardContent>
        {/* ========================================== start card actions ======================================================== */}
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
            <IconButton onClick={handleLikeClick} aria-label="likes">
              <Favorite
                color={isLikedLocally ? "error" : "inherit"}
                sx={{
                  transition: "color 0.1s ease-in",
                  transform: isLikedLocally ? "scale(1.1)" : "scale(1)",
                }}
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
                open={postDialog}
                onClose={() => {
                  setPostDialog(false);
                  setZoom(1); // 🔄 رجّع الزوم للوضع الطبيعي عند الغلق
                }}
                fullWidth
                maxWidth="sm"
              >
                <Box
                  sx={{
                    p: 2,
                    overflow: "hidden",
                    cursor: "zoom-in",
                  }}
                  onWheel={(e) => {
                    // e.preventDefault();

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
        {/* ========================================== end card actions ========================================================= */}
        {isError && (
          <Typography
            variant="body2"
            sx={{ color: theme.palette.error.main, textAlign: "center", mt: 1 }}
          >
            {
              // @ts-ignore
              error?.data?.message || "Failed to delete post."
            }
          </Typography>
        )}
        <AddComment
          post={post}
          user={user}
          openCommentBox={openCommentBox}
          setOpenCommentBox={setOpenCommentBox}
          commentRefs={undefined}
          commentIdToHighlight={undefined}
        />
      </Card>
    </Box>
  );
};

export default CardComponent;
