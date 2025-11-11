import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Button,
  Box,
} from "@mui/material";
import { useParams } from "react-router-dom";
import LoadingPage from "../../components/loadingPage";
import CardComponent from "./cardComponent";
import { useGetUserPostsQuery } from "../../Api/posts/postsApi";
import { useGetUserByUserNameQuery } from "../../Api/user/userApi";
import Err_404Page from "../../components/NotFound-404";

const UserProfilePage = () => {
  const { username } = useParams(); // الحصول على اسم المستخدم من الـ URL
  const [error, setError] = useState(null);
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useGetUserByUserNameQuery(username);
  // posts
  const { data: posts = [], isLoading: postsLoading } = useGetUserPostsQuery(
    user?._id, // أو user.username حسب API
    { skip: !user } // تجاهل الـ query حتى يكون user موجود
  );

  useEffect(() => {
    if (userError) {
      setError("User not found");
    }
  }, [userError]);

  if (error) {
    return <Err_404Page />;
  }
  if (userLoading || postsLoading) return <LoadingPage />;

  if (userError || !user) {
    return <div>User not found</div>;
  }

  if (userError) {
    return <Err_404Page />; // عرض صفحة الخطأ إذا كان المستخدم غير موجود
  }

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
            <Avatar
              src={user.avatar}
              alt={user.name}
              sx={{ width: 150, height: 150, marginBottom: 2 }}
            />
            <Typography variant="h5">{user.name}</Typography>
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ marginBottom: 2 }}
            >
              @{user.username}
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
              Email: {user.email}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ marginBottom: 2 }}
            >
              Edit Profile
            </Button>
          </Paper>
        </Grid>

        {/* قسم المنشورات */}
        <Grid sx={{ width: "100%" }}>
          <Paper elevation={3} sx={{ padding: 2, width: "100%" }}>
            {posts.length === 0 && <Box>
                <Typography
                  sx={{ textAlign: "center" }}
                  variant="body1"
                  color="inherit"
                >
                  no posts for thisi user
                </Typography>
              </Box>}
            
            {posts?.map((post) => (
              <CardComponent post={post} key={post?._id} />
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
export default UserProfilePage;
