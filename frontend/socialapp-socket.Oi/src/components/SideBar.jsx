import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  Stack,
  styled,
  TextField,
  Typography,
} from "@mui/material";
const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const SmallAvatar = styled(Avatar)(({ theme }) => ({
  width: 22,
  height: 22,
  border: `2px solid ${theme.palette.background.paper}`,
}));

const SideBar = ({ sidebarWidth }) => {
  return (
    <Box
      sx={{
        display: { xs: "none", md: "block" },
        width: sidebarWidth,
        position: "fixed",
        top: 0,
        right: 0,
        height: "100%",
        bgcolor: "background.paper",
        boxShadow: 1,
        pt: 2,
        // px: 2,
      }}
      role="presentation"
    >
      {/* search box */}
      <TextField id="outlined-search" label="Search field" type="search" />
      <Divider />
      <List>
        <ListItem>
          <Stack direction="column" spacing={2}>
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
          <Stack direction="column" spacing={2}>
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
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                  <Avatar
                    alt="Travis Howard"
                    src="/static/images/avatar/2.jpg"
                  />
                  <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
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
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                  <Avatar
                    alt="Travis Howard"
                    src="/static/images/avatar/2.jpg"
                  />
                  <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
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
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                  <Avatar
                    alt="Travis Howard"
                    src="/static/images/avatar/2.jpg"
                  />
                  <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
                </AvatarGroup>
                <span style={{ fontSize: "10px", marginLeft: "4px" }}>
                  last seen 2 hours ago
                </span>
              </Box>
            </Box>
            <Divider />
            <Box>
              <Typography
                sx={{ fontSize: "16px", fontWeight: "bold", pb: 1 }}
                color="inhirit"
              >
                {" "}
                what's happening
              </Typography>
              <Typography variant="body1" color="inhirit">
                Get real-time updates on current events and trending topics
              </Typography>
            </Box>
          </Stack>
        </ListItem>
        <ListItem>
          <Typography variant="body1" color="initial">
            Item 2
          </Typography>
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
