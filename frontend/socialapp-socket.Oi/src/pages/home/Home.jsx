import Box from "@mui/material/Box/";
import PostComposer from "./postcomposer";
import GetPosts from "./getPosts";
import { useEffect, useState } from "react";
// import { useGetUserByNameQuery } from "../Api/Redux/userApi"; // Your RTK Query hook
import { useNavigate } from "react-router";
import LoadingPage from "../../components/loadingPage";
import { useSelector } from "react-redux";
import { useCreatePostMutation } from "../../Api/posts/postsApi";

const Home = () => {
    const { user, isLoadingAuth } = useSelector((state) => state.auth);
    const navigate = useNavigate();
  useEffect(() => {
    if (isLoadingAuth) return; // لسه بيجيب بيانات المستخدم، استنى

    if (!user) {
      navigate("/signin");
      return;
    }
  }, [navigate, user, isLoadingAuth]);
  //========================== save image to preview and in file to send it to backend  =================================


  if (isLoadingAuth) {
    return <LoadingPage />;
  }
  if (!user) return null; // لأن navigate هيشتغل أصلاً، فمش لازم ترندر الصفحة

  return (
    <Box sx={{ width: "100%" }}>
      <PostComposer user={user}/>
      <GetPosts />
    </Box>
  );
};

export default Home;
