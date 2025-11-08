import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import {
  Bookmark,
  BusinessCenter,
  DarkMode,
  ElectricBolt,
  Explore,
  GroupAdd,
  Logout,
  Message,
  More,
  Notifications,
  Person,
  PostAdd,
  Sunny,
  WorkspacePremium,
  X,
} from "@mui/icons-material";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import { Link, useLocation, useNavigate } from "react-router";
import GrokIcon from "../styles/grokIcon";
import { Button } from "@mui/material";
import { useSignOutMutation } from "../pages/Api/Redux/userApi"; // Your RTK Query hook
import { useDispatch } from "react-redux";
import { HandleLogout } from "../pages/Api/auth";

function ResponsiveDrawer({
  handleDrawerClose,
  handleDrawerTransitionEnd,
  mobileOpen,
  theme,
  handleTheme,
}) {
  //=================================================================================
  //=================================================================================
  const location = useLocation();
  const iconColor = theme.palette.mode === "dark" ? "inherit" : "primary";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [signOut,{ isLoading, isSuccess, error }] = useSignOutMutation();
  
  //list items data
  const myList = [
    {
      title: "Home",
      icon: <AccountBoxIcon color={iconColor} />,
      pathname: "/",
    },
    {
      title: "Explore",
      icon: <Explore color={iconColor} />,
      pathname: "/explore",
    },
    {
      title: "Notifications",
      icon: <Notifications color={iconColor} />,
      pathname: "/notifications",
    },
    {
      title: "Messages",
      icon: <Message color={iconColor} />,
      pathname: "/messages",
    },
    {
      title: "Grok",
      icon: <GrokIcon />,
      pathname: "/grok",
    },
    {
      title: "Bookmarks",
      icon: <Bookmark color={iconColor} />,
      pathname: "/bookmarks",
    },
    {
      title: "Jobs",
      icon: <BusinessCenter color={iconColor} />,
      pathname: "/jobs",
    },
    {
      title: "Communities",
      icon: <GroupAdd color={iconColor} />,
      pathname: "/communities",
    },
    {
      title: "premimum",
      icon: <WorkspacePremium color={iconColor} />,
      pathname: "/premium",
    },
    {
      title: "Verified Orgs",
      icon: <ElectricBolt color={iconColor} />,
      pathname: "/verified-orgs",
    },
    {
      title: "Profile",
      icon: <Person color={iconColor} />,
      pathname: "/profile",
    },
    {
      title: "more",
      icon: <More color={iconColor} />,
      pathname: "/more",
    },
  ];
  const drawer = (
    <>
      <Box
        sx={{
          height: "64px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          // underline="none"
          style={{
            height: "100%",
            fontSize: "2rem",
            color: "inherit",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <X sx={{ ml: 0.5, fontSize: "2.5rem", fontWeight: "bold" }} />
        </Link>
      </Box>
      <Divider />
      {/* <Toolbar /> */}
      <IconButton
        onClick={handleTheme}
        sx={{ mx: "auto", display: "block" }}
        color="inherit"
      >
        {theme.palette.mode === "dark" ? <Sunny /> : <DarkMode />}
      </IconButton>
      <List>
        <Divider />
        <>
          {myList.map((item, index) => {
            return (
              <ListItem
                sx={{
                  backgroundColor:
                    location.pathname === item.pathname
                      ? theme.palette.action.selected
                      : "inherit",
                }}
                key={index}
                onClick={() => {
                  navigate(item.pathname);
                  handleDrawerClose();
                }}
                disablePadding
              >
                <ListItemButton
                  sx={{ justifyContent: { sm: "center", lg: "flex-start" } }}
                >
                  <ListItemIcon
                    sx={{ justifyContent: { sm: "center", lg: "flex-start" } }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    sx={{ display: { xs: "block", sm: "none", md: "block" } }}
                    primary={item.title}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}

          {/* add post */}
          <ListItem
            onClick={() => {}}
            sx={{ mt: 5, px: 0, display: "flex", justifyContent: "center" }}
          >
            <IconButton>
              <PostAdd
                color={iconColor}
                sx={{ mr: 1, display: { xs: "none", sm: "block", md: "none" } }}
              />
            </IconButton>
            <Button
              variant="outlined"
              sx={{
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "white"
                    : theme.palette.background.default,
                color: theme.palette.text.default,
                border: "none",
                fontSize: "15px",
                borderRadius: "10px",
                padding: "5px 10px",
                cursor: "pointer",
                textTransform: "none",
                display: { xs: "block", sm: "none", md: "block" },
              }}
            >
              Add Post
            </Button>
          </ListItem>
          <ListItem
            
            sx={{ mt: 5, px: 0 }}
          >
            <ListItemButton
            onClick={() => {
              HandleLogout(dispatch, signOut,navigate);
            }}
              sx={{ justifyContent: { sm: "center", lg: "flex-start" } }}
            >
              <ListItemIcon
                sx={{ justifyContent: { sm: "center", lg: "flex-start" } }}
              >
                <Logout color={"error"} />
              </ListItemIcon>
              <ListItemText
                sx={{
                  display: { xs: "block", sm: "none", md: "block" },
                  color: "red",
                }}
                primary="Logout"
              />
            </ListItemButton>
          </ListItem>
        </>
        {/* )} */}
      </List>
    </>
  );

  return (
    // Mobile drawer
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen} // Mobile drawer open state
        onTransitionEnd={handleDrawerTransitionEnd} // Handle transition end
        onClose={handleDrawerClose} // close drawer when press on any place outside drawer
        sx={{
          ml: { xs: 0, sm: "240px" },
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: "240px" },
        }}
        slotProps={{
          root: {
            keepMounted: true, // Better open performance on mobile.
          },
        }}
      >
        {drawer}
      </Drawer>
      {/* Permanent drawer for larger screens */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          position: "sticky",
          top: "64px", // يلتصق أسفل AppBar
          height: "calc(100vh - 64px)", // الارتفاع المتبقي من الشاشة
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: { sm: "100px", md: `100%` },
            minWidth: "100%",
            transition: "width 0.3s ease-out",
            position: "sticky",
            top: "64px",
            height: `calc(100vh - 64px)`,
            backgroundColor:theme.palette.background.default
            // borderRight: "1px solid",
            // borderColor: "divider",
            
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default ResponsiveDrawer;
