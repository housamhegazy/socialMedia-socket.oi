import { Box, Typography } from "@mui/material";
import LoadingPage from "../../components/loadingPage";
import CardComponent from "../userprofile/cardComponent";
import { useGetAllPostsQuery } from "../../Api/posts/postsApi";

// start
const GetPosts = () => {
  const {
    data: posts = [], // 🧩 ندي قيمة افتراضية لتفادي الخطأ لو undefined
    isLoading,
    isError,
    error,
  } = useGetAllPostsQuery();

  if (isLoading) {
    return <LoadingPage />;
  }


  // ❌ حالة الخطأ
  if (isError) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Typography color="error">
          {error?.data?.message || "Error while fetching posts"}
        </Typography>
      </Box>
    );
  }

  if (posts.length === 0) {
    return (
      <Box
        sx={{
          margin: "0 auto",
          my: 5,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No posts available yet.
        </Typography>
      </Box>
    );
  }
  return (
    <Box>
      {posts &&
        posts.length > 0 &&
        posts.map((post) => {
          return <CardComponent post={post} key={post?._id} />;
        })}
    </Box>
  );
};

export default GetPosts;
