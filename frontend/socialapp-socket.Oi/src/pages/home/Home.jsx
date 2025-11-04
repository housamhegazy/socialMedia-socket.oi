import Box from "@mui/material/Box/";
import React from "react";
import TrendsCard from "../../components/trendCard";
import PostComposer from "./postcomposer";
import GetPosts from "./getPosts";

const Home = () => {
  return (
    <Box>
      <PostComposer />
      <GetPosts/>

    </Box>
  );
};

export default Home;
