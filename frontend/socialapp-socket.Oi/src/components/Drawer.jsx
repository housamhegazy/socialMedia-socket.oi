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
  Cloud,
  DarkMode,
  ElectricBolt,
  Explore,
  GroupAdd,
  Logout,
  Message,
  More,
  Notifications,
  Person,
  PrecisionManufacturingOutlined,
  Sunny,
  UploadFile,
  WorkspacePremium,
} from "@mui/icons-material";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import HomeIcon from "@mui/icons-material/Home";
import { Link, useLocation, useNavigate } from "react-router";
import GrokIcon from "../styles/grokIcon";

function ResponsiveDrawer({
  handleDrawerClose,
  handleDrawerTransitionEnd,
  mobileOpen,
  drawerWidth,
  theme,
  handleTheme,
}) {
  //=================================================================================
  //=================================================================================
  const location = useLocation();
  const iconColor = theme.palette.mode === "dark" ? "inherit" : "primary";
  const navigate = useNavigate();
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
      icon: <GrokIcon color={iconColor} />,
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
    }
  ];
  const drawer = (
    <div>
      <Box sx={{height:"80px",display:"flex",justifyContent:"center",alignItems:"center"}}>
        <Link
          to="/"
          // underline="none"
          style={{
            height:"100%",
            fontSize: "1rem",
            color: "inherit",
            display:"flex",
            justifyContent:"center",
            alignItems:"center",
          }}
        >
          Customer Dashboard
        </Link>
      </Box>
          <Divider/>
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
                  <ListItemButton>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.title} />
                  </ListItemButton>
                </ListItem>
              );
            })}
            <ListItem onClick={() => {}} sx={{ mt: 5, px: 0 }}>
              <ListItemButton>
                <ListItemIcon>
                  <Logout color={"error"} />
                </ListItemIcon>
                <ListItemText primary="Logout" sx={{ color: "red" }} />
              </ListItemButton>
            </ListItem>
          </>
        {/* )} */}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: `${drawerWidth}px` }, flexShrink: { sm: 0 } }}
    >
      {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
      <Drawer
        variant="temporary"
        open={mobileOpen} // Mobile drawer open state
        onTransitionEnd={handleDrawerTransitionEnd} // Handle transition end
        onClose={handleDrawerClose} // close drawer when press on any place outside drawer
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
        slotProps={{
          root: {
            keepMounted: true, // Better open performance on mobile.
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}

export default ResponsiveDrawer;