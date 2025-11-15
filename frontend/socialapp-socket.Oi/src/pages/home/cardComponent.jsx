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
} from "@mui/material";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useDeletePostMutation, useLikePostMutation } from "../../Api/posts/postsApi";
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
  console.log(post);
  //===================== edite dialog =================================
  const [openDialog,setOpenDialog] = useState(false)
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
  const openDialogFunc = ()=>{
    setOpenDialog(true)
    setAnchorEl(null);
  }

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
    {openDialog && <DialogComp {...{post,setOpenDialog}}/>}
    
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
            src={isMyProfile ? user.avatar :post.owner?.avatar }
          >
              {!post?.owner?.avatar && post?.owner?.username?.[0]?.toUpperCase()}
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
                    onClick={()=>{
                      handleDeleteMenu(post._id)
                    }}
                    sx={{ color: "error.main" }}
                  >
                    <ListItemIcon>
                      <DeleteForever fontSize="small" color="error" />
                    </ListItemIcon>
                    <Typography variant="body2">delete </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={()=>{
                      openDialogFunc()
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
      {post.image && <CardMedia
        component="img"
        height="194"
        image={post?.image}
        alt="Paella dish"
        loading="lazy"
      />}
      
      <CardContent>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {post.text}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton  onClick={() => likePost(post._id)} aria-label="likes">
          <Favorite sx={{color:post.likes.includes(user._id) ? "error" : "inherit" }} />
        </IconButton>
        {Array.isArray(post?.likes) ? post.likes.length : 0}
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
      <AddComment post = {post}  user={user}/>
    </Card>
    </Box>
    

  );
};

export default CardComponent;
