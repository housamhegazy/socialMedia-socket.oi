import { Box, createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import AppBarComponent from "./components/AppBar";
import { Outlet } from "react-router";
import Footer from "./components/Footer";
import ResponsiveDrawer from "./components/Drawer";
import { useMemo, useState } from "react";
import getDesignTokens from "./styles/theme";
import SideBar from "./components/SideBar";
const drawerWidth = { xs: "70px",  md: "200px" };
const sidebarWidth = 240
const Root = () => {
  //open and close drawer functions
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };
  //#####################################
  //theme functions
  // ###############################
  //get theme from local storage
  const localTheme = localStorage.getItem("localTheme");
  //set initial theme
  const [mode, setmode] = useState(
    localTheme === null ? "light" : localTheme === "light" ? "light" : "dark"
  );

  //memoize theme لانه بيمنع تكرار تغيير الثيم مع كل تحميل للصفحات واستهلاك الباندويدز
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  //change theme function
  const handleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setmode(newMode);
    localStorage.setItem("localTheme", newMode);
  };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="root">
        <AppBarComponent
          drawerWidth={drawerWidth}
          handleDrawerToggle={handleDrawerToggle}
          sidebarWidth={sidebarWidth}
        />
        {/* sidebar component */}
        <SideBar {...{ drawerWidth, sidebarWidth }} />
        {/* drawer component */}
        <ResponsiveDrawer
          handleDrawerClose={handleDrawerClose}
          handleDrawerTransitionEnd={handleDrawerTransitionEnd}
          mobileOpen={mobileOpen}
          drawerWidth={drawerWidth}
          theme={theme}
          handleTheme={handleTheme}
        />
        <Box component={"main"}
          sx={{
            ml: { sm: `${drawerWidth}px` },
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            p: 3,
            minHeight: "calc(100vh - 64px)",
            padding: "20px",
            marginTop: "20px",
            flex: 1,
          }}
        >
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default Root;
