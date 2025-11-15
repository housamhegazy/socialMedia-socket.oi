import {
  MoreVert,
  Favorite,
  Share,
  Delete,
  DeleteForever,
  PersonAdd,
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
  CircularProgress,
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
import DialogComp from "./dialog";
import AddComment from "./addComment";
const CardComponent = ({ post, isMyProfile }) => {
  const { user } = useSelector((state) => state.auth);
  const { refetch } = useGetUserByNameQuery();
  const [deletePost, { isLoading, isError, error }] = useDeletePostMutation();
  //=================== add likes =========================================
  const [likePost] = useLikePostMutation();
  //===================== edite dialog =================================
  const [openDialog, setOpenDialog] = useState(false);
  const [openLikesDialog, setOpenLikesDialog] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  //=================== menu functions ============================
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

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
  return (
    <Box>
      {openDialog && <DialogComp {...{ post, setOpenDialog }} />}

      <Card
        sx={{
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
                      minWidth: 180,
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
            component="img"
            height="194"
            image={post?.image}
            alt="Paella dish"
            loading="lazy"
          />
        )}

        <CardContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {post.text}
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
          <Avatar
            src={like.avatar}
            alt={like.name}
            sx={{ mr: 2 }}
          >
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
          </Box>
          <IconButton aria-label="share">
            <Share />
          </IconButton>
        </CardActions>
        {isError && (
          <Typography
            variant="body2"
            sx={{ color: theme.palette.error.main, textAlign: "center", mt: 1 }}
          >
            {error?.data?.message || "Failed to delete post."}
          </Typography>
        )}
        <AddComment post={post} user={user} />
      </Card>
    </Box>
  );
};

export default CardComponent;
