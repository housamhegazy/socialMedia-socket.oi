import { MoreVert, Favorite, Share, Delete } from "@mui/icons-material";
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
} from "@mui/material";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useDeletePostMutation } from "../../Api/posts/postsApi";
import Swal from "sweetalert2";
import { useGetUserByNameQuery } from "../../Api/user/userApi";
import { formatDistance } from "date-fns";
const CardComponent = ({ post }) => {
  const { user } = useSelector((state) => state.auth);
  const { refetch } = useGetUserByNameQuery();
  const [deletePost, { isLoading, isError, error }] = useDeletePostMutation();
  const theme = useTheme();
  const navigate = useNavigate();

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
              navigate(`/${post?.owner?.username}`);
            }}
            sx={{ bgcolor: "#d93526", cursor: "pointer" }}
            aria-label="recipe"
          >
            <img src={post.owner && post.owner.image} alt="" />R
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVert />
          </IconButton>
        }
        title={post?.owner?.name}
        subheader={formatDistance(new Date(post.createdAt), new Date())}
      />
      <CardMedia
        component="img"
        height="194"
        image={post.image}
        alt="Paella dish"
        loading="lazy"
      />
      <CardContent>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {post.text}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="likes">
          <Favorite />
        </IconButton>
        {Array.isArray(post?.likes) ? post.likes.length : 0}
        <IconButton aria-label="share">
          <Share />
        </IconButton>
        {/* Delete button with loader */}
        {post?.owner?._id === user?._id && (
          <Box sx={{ position: "relative", ml: 1 }}>
            <IconButton
              aria-label="delete"
              onClick={() => handleDelete(post._id)}
              disabled={isLoading} // ⛔ تعطيل أثناء الحذف
            >
              {isLoading ? (
                <CircularProgress size={22} color="error" />
              ) : (
                <Delete color="error" />
              )}
            </IconButton>
          </Box>
        )}
      </CardActions>
      {isError && (
        <Typography
          variant="body2"
          sx={{ color: theme.palette.error.main, textAlign: "center", mt: 1 }}
        >
          {error?.data?.message || "Failed to delete post."}
        </Typography>
      )}
    </Card>
  );
};

export default CardComponent;
