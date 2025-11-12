import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Button,
  Box,
  IconButton,
  useTheme,
} from "@mui/material";
import { useParams } from "react-router-dom";
import LoadingPage from "../../components/loadingPage";
import CardComponent from "./cardComponent";
import {
  useDeleteAllPostsMutation,
  useGetUserPostsQuery,
} from "../../Api/posts/postsApi";
import {
  useGetUserByUserNameQuery,
  useUpdateAvatarMutation,
} from "../../Api/user/userApi";
import Err_404Page from "../../components/NotFound-404";
import { useSelector } from "react-redux";
import { Done, Edit, PersonAdd } from "@mui/icons-material";
import ProfileMenu from "./menuComponent";
import Swal from "sweetalert2";
import PostComposer from "../home/createPost";

const UserProfilePage = () => {
  const theme = useTheme();
  // ==================== get user data from backend and compare it with current user ===========================================
  const { username } = useParams();
  //بيانات المستخدم الحالي اللي مسجل دخول
  const { user: currentUser } = useSelector((state) => state.auth);
  const isMyProfile = username === currentUser?.username; //  التحقق من ان اسم المستخدم ده هو نفسه المستخدم المسجل دخول
  // بيانات المستخدم اللي حابب افتح صفحته
  const {
    data: profile,
    isLoading: userLoading,
    isError: userError,
  } = useGetUserByUserNameQuery(username, {
    skip: isMyProfile, // لو هو نفس المستخدم، ما تبعتش request
  });
  // لو اليوزر هو نفسه المستخدم الحالي
  const userProfile = isMyProfile ? currentUser : profile;

  //============================ Get posts from backend ===============================================
  const { data: posts = [], isLoading: postsLoading } = useGetUserPostsQuery(
    userProfile?._id, // أو user.username حسب API
    { skip: !userProfile } // تجاهل الـ query حتى يكون user موجود
  );
  //============================ import delete all posts from posts api ===========================================
  const [deleteAllPosts, { isLoading, isSuccess, isError }] =
    useDeleteAllPostsMutation();

  // ====================================== error state =================================================
  const [error, setError] = useState(null);
  //======================================== edit avatar states ======================================
  const [loadingPreview, setLoadingPreview] = useState(false); // loading preview box
  const [file, setFile] = useState(null); // save image to send to db
  const [preview, setPreview] = useState(null); // save image in preview in page
  //=============================== import update avatar ======================================
  const [updateAvatar, { loading }] = useUpdateAvatarMutation();

  useEffect(() => {
    if (userError) {
      setError("User not found");
    }
  }, [userError]);

  if (error) {
    return <Err_404Page />;
  }
  if (userLoading || postsLoading) return <LoadingPage />;

  if (userError || !userProfile) {
    return <div>User not found</div>;
  }

  if (userError) {
    return <Err_404Page />; // عرض صفحة الخطأ إذا كان المستخدم غير موجود
  }

  //========================================== delete all posts =========================================
  const handleDelete = async () => {
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
        await deleteAllPosts().unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
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
  //============================================== edite avatar ===========================================================
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

  const handleEditeAvatar = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file); // ✨ لازم نفس الاسم اللي السيرفر مستنيّه
    try {
      await updateAvatar(formData).unwrap();
      Swal.fire({
        icon: "success",
        title: "تم تحديث الصورة بنجاح!",
        timer: 1500,
        showConfirmButton: false,
      });

      handleRemoveImage()
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "حدث خطأ!",
        text: error.message || "لم يتم رفع الصورة.",
      });
    }
  };
  //==========================================remove preview====================================
  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
  };
  return (
    <Container maxWidth="lg" sx={{ paddingTop: "2rem" }}>
      {/* صفحة المستخدم */}
      <Grid container spacing={4}>
        {/* قسم معلومات المستخدم */}
        <Grid sx={{ width: "100%" }}>
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* ================================= user avatar ============================================= */}
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Avatar
                src={preview ? preview : userProfile.avatar}
                alt={userProfile.name}
                sx={{
                  width: 150,
                  height: 150,
                  marginBottom: 2,
                  border: "2px solid #ddd",
                }}
              />

              {isMyProfile && (
                <>
                  {/* 🔥 زر القلم */}
                  <IconButton
                    component="label"
                    sx={{
                      position: "absolute",
                      bottom: 10,
                      right: 10,
                      bgcolor: "background.paper",
                      boxShadow: 2,
                      "&:hover": { bgcolor: "primary.main", color: "#fff" },
                      transition: "0.3s",
                    }}
                    size="small"
                  >
                    <Edit fontSize="small" />
                    <input
                      onChange={(e) => {
                        handleImage(e);
                      }}
                      type="file"
                      style={{ display: "none" }}
                      multiple
                    />
                  </IconButton>
                  {preview && (
                    <IconButton
                      onClick={handleEditeAvatar}
                      sx={{
                        position: "absolute",
                        bottom: "-10px",
                        right: "50px",
                      }}
                    >
                      {" "}
                      <Done />{" "}
                    </IconButton>
                  )}
                </>
              )}
            </Box>

            {/* ====================================== end user avatar =================================================== */}
            <Typography variant="h5">{userProfile.name}</Typography>
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ marginBottom: 2 }}
            >
              @{userProfile.username}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ marginBottom: 2 }}
            >
              {/* {user.bio} */}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ marginBottom: 2 }}
            >
              Email: {userProfile.email}
            </Typography>
            {isMyProfile ? (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ marginBottom: 2 }}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon=<PersonAdd />
                sx={{
                  borderRadius: "2rem",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                }}
              >
                "Add Friend"
              </Button>
            )}
          </Paper>
        </Grid>

        {/*===================================== قسم المنشورات ========================================================*/}
        {/* create post */}
        {isMyProfile && <PostComposer user={currentUser} />}
        <Grid sx={{ width: "100%" }}>
          <Paper elevation={3} sx={{ padding: 2, width: "100%" }}>
            {posts.length > 0 && (
              <>
                {isMyProfile && (
                  <Box style={{ display: "flex", justifyContent: "flex-end" }}>
                    <ProfileMenu
                      onDelete={handleDelete}
                      BtnName={isLoading ? "Deleting..." : "Delete All Posts"}
                      isMyProfile={isMyProfile}
                    />
                  </Box>
                )}
              </>
            )}

            {posts.length === 0 && (
              <Box>
                <Typography
                  sx={{ textAlign: "center" }}
                  variant="body1"
                  color="inherit"
                >
                  {isMyProfile
                    ? "you dont create any posts yet , what is in your minde ?"
                    : `no posts for ${profile.name}`}
                </Typography>
              </Box>
            )}
            {posts?.map((post) => (
              <CardComponent
                post={post}
                key={post?._id}
                isMyProfile={isMyProfile}
              />
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
export default UserProfilePage;
