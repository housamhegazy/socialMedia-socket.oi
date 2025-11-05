import {
  Box,
  createTheme,
  CssBaseline,
  Grid,
  ThemeProvider,
} from "@mui/material";
import AppBarComponent from "./components/AppBar";
import { Outlet } from "react-router";
import Footer from "./components/Footer";
import ResponsiveDrawer from "./components/Drawer";
import { useMemo, useState } from "react";
import getDesignTokens from "./styles/theme";
import SideBar from "./components/SideBar";
// const drawerWidth = 200;
// const sidebarWidth = 280;
const ContainerMaxWidth = 1200;
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

  //container (flex - column )
  //1-==== appbar
  //2-====page(grid container)
  //====== grid drawer (no height) position: 'sticky' top: "64px",
  //====== grid outlet  (no height)
  //====== grid sidebar (no height) position: 'sticky' top: "64px",
  //3-====footer

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="root" sx={{ display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            width: "100%",
            maxWidth: `${ContainerMaxWidth}px`,
            height: "64px",
            margin: "0 auto",
            position: "sticky",
            top: "0",
            zIndex: "1000",
          }}
        >
          <AppBarComponent handleDrawerToggle={handleDrawerToggle} />
        </Box>
        {/* عشان خاصية ال ستيكي تشتغل لازم يكون ارتفاع الكونتينر اكبر من ارتفاع البوكس الداخلي */}
        <Grid
          container
          spacing={0}
          sx={{
            width: "100%",
            maxWidth: `${ContainerMaxWidth}px`,
            margin: "0 auto",
            minHeight: "200vh",
            flexWrap: "nowrap",
            alignItems: "stretch",
          }}
        >
          <Grid
            size={{ xs: 0, sm: 2, md: 3 }}
            sx={{
              borderRight: "1px solid",
              borderColor: "divider",
              flexShrink: 0,
              position: "sticky",
              top: "64px",
              height: "100vh",
            }}
          >
            <ResponsiveDrawer
              handleDrawerClose={handleDrawerClose}
              handleDrawerTransitionEnd={handleDrawerTransitionEnd}
              mobileOpen={mobileOpen}
              theme={theme}
              handleTheme={handleTheme}
            />
          </Grid>

          <Grid
            size={{ xs: 12, sm: 10, md: 6 }}
            sx={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: theme.palette.background.default,
              borderRight: "1px solid",
              borderColor: "divider",
              flexGrow: 1,
              minHeight: "calc(100vh - 64px)",
            }}
          >
            <Outlet />
          </Grid>
          <Grid
            size={{ xs: 0, sm: 0, md: 3 }}
            sx={{
              position: "sticky",
              top: "64px",
              height: "100vh",
            }}
          >
            <SideBar />
          </Grid>
        </Grid>
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default Root;
