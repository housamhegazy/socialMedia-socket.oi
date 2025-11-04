import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import TrendsCard from "./trendCard";

const SideBar = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        // width:{md:"200px",lg:"200px"},
        display: { xs: "none", md: "block" },
        position: "sticky",
        top: "64px",
        height: "calc(100vh - 64px)",
        bgcolor: "background.paper",
        overflowY: "auto",
        // boxShadow: 1,
        // flexShrink: 0,
        borderLeft: `1px solid ${theme.palette.divider}`,
      }}
      role="presentation"
    >
      {/* search box */}
      <Box sx={{display:"flex",justifyContent:"center",alignItems:"center",py:2}}>
        <TextField
          id="outlined-search"
          label="Search field"
          type="search"
          
        />
      </Box>
      <Divider />
      <List>
        <ListItem>
          <Stack direction="column" spacing={2} sx={{width:"100%"}}>
            <Typography
              color="inhirit"
              sx={{ fontSize: "16px", fontWeight: "bold" }}
            >
              Subscribe to Premium
            </Typography>
            <Typography variant="body1" color="inhirit">
              Get access to exclusive content
            </Typography>
            <Button variant="contained" color="primary">
              Subscribe Now
            </Button>
          </Stack>
        </ListItem>
        <Divider />
        <ListItem>
          <Stack direction="column" spacing={2} sx={{width:"100%"}}>
            <Box>
              <Typography
                sx={{ fontSize: "16px", fontWeight: "bold", pb: 1 }}
                color="inhirit"
              >
                {" "}
                Todays News
              </Typography>
              <Typography
                sx={{ fontSize: "10px", pb: 1, pt: 1 }}
                variant="body1"
                color="inhirit"
              >
                Stay updated with the latest news gjjhj jhjh housam hegazy
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", pb: 2 }}>
                <AvatarGroup spacing={24} sx={{ justifyContent: "flex-end" }}>
                  <Avatar
                    alt="Remy Sharp"
                    src="https://images.pexels.com/photos/609549/pexels-photo-609549.jpeg"
                  />
                  <Avatar
                    alt="Travis Howard"
                    src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"
                  />
                  <Avatar
                    alt="Cindy Baker"
                    src="https://images.pexels.com/photos/2218786/pexels-photo-2218786.jpeg"
                  />
                </AvatarGroup>
                <span style={{ fontSize: "10px", marginLeft: "4px" }}>
                  last seen 2 hours ago
                </span>
              </Box>
              <Divider />
              <Typography
                sx={{ fontSize: "10px", pb: 1, pt: 1 }}
                variant="body1"
                color="inhirit"
              >
                Stay updated with the latest news gjjhj jhjh housam hegazy
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", pb: 2 }}>
                <AvatarGroup spacing={24} sx={{ justifyContent: "flex-end" }}>
                  <Avatar
                    alt="Remy Sharp"
                    src="https://images.pexels.com/photos/609549/pexels-photo-609549.jpeg"
                  />
                  <Avatar
                    alt="Travis Howard"
                    src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"
                  />
                  <Avatar
                    alt="Cindy Baker"
                    src="https://images.pexels.com/photos/2218786/pexels-photo-2218786.jpeg"
                  />
                </AvatarGroup>
                <span style={{ fontSize: "10px", marginLeft: "4px" }}>
                  last seen 2 hours ago
                </span>
              </Box>
              <Divider />
              <Typography
                sx={{ fontSize: "10px", pb: 1, pt: 1 }}
                variant="body1"
                color="inhirit"
              >
                Stay updated with the latest news gjjhj jhjh housam hegazy
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", pb: 2 }}>
                <AvatarGroup spacing={24} sx={{ justifyContent: "flex-end" }}>
                  <Avatar
                    alt="Remy Sharp"
                    src="https://images.pexels.com/photos/609549/pexels-photo-609549.jpeg"
                  />
                  <Avatar
                    alt="Travis Howard"
                    src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"
                  />
                  <Avatar
                    alt="Cindy Baker"
                    src="https://images.pexels.com/photos/2218786/pexels-photo-2218786.jpeg"
                  />
                </AvatarGroup>
                <span style={{ fontSize: "10px", marginLeft: "4px" }}>
                  last seen 2 hours ago
                </span>
              </Box>
            </Box>
            <Divider />
            
          </Stack>
        </ListItem>
        <ListItem>
          <Box
              sx={{
                width: "100%",
                // p: 2,
                // إخفاء الكارد على الشاشات الصغيرة (xs و sm) وعرضه على الشاشات الكبيرة (lg)
                display: { xs: "none", md: "block" },
              }}
            >
              <TrendsCard />
            </Box>
        </ListItem>
        <ListItem>
          <Typography variant="body1" color="initial">
            Item 3
          </Typography>
        </ListItem>
      </List>
    </Box>
  );
};

export default SideBar;
