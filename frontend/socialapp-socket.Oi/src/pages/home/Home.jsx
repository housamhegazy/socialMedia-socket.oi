import Box from "@mui/material/Box/";
import PostComposer from "./postcomposer";
import GetPosts from "./getPosts";
import { useState } from "react";

const Home = () => {
  const [posts, setPosts] = useState([]);
    const handleGetPosts = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/posts`, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setPosts(data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Box sx={{width:"100%"}}>
      <PostComposer {...{handleGetPosts}} />
      <GetPosts {...{handleGetPosts,posts}}/>
    </Box>
  );
};

export default Home;
