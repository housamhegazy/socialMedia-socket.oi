import {
  Avatar,
  Box,
  Card,
  CardContent,
  IconButton,
  Typography,
} from "@mui/material";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LoadingPage from "../../components/loadingPage";

// start
const GetPosts = ({ posts, loading }) => {
  if (loading) {
    return <LoadingPage />;
  }
  if (!posts || posts.length < 1) {
    return (
      <Box
        sx={{
          margin: "0 auto",
          my: 5,
          display: "flex",
          justifyContent: "center",
        }}
      >
        no data
      </Box>
    );
  }
  return (
    <Box>
      {posts &&
        posts.length > 0 &&
        posts.map((post) => {
          return (
            <Card
              key={post._id}
              sx={{ maxWidth: "100%", margin: "0 auto", my: 5 }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: "#d93526" }} aria-label="recipe">
                    <img src={post.owner ? post.owner.image : ""} alt="" />R
                  </Avatar>
                }
                action={
                  <IconButton aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                }
                title={
                  post.owner ? post.owner.name : "Shrimp and Chorizo Paella"
                }
                subheader={post.createdAt}
              />
              <CardMedia
                component="img"
                height="194"
                image={post.image}
                alt="Paella dish"
              />
              <CardContent>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {post.text}
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                <IconButton aria-label="add to favorites">
                  <FavoriteIcon />
                </IconButton>
                <IconButton aria-label="share">
                  <ShareIcon />
                </IconButton>
              </CardActions>
            </Card>
          );
        })}
    </Box>
  );
};

export default GetPosts;
