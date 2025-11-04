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
const drawerWidth = 200;
const sidebarWidth = 280;
const ContainerMaxWidth = 1400
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
      <Box className="root" sx={{  display: 'flex', flexDirection: 'column' }}>
        <AppBarComponent
          handleDrawerToggle={handleDrawerToggle}
          ContainerMaxWidth = {ContainerMaxWidth}
        />
        <Grid
          container
          spacing={0}
          sx={{
            maxWidth: `${ContainerMaxWidth}px`,
            margin: "0 auto",
            flexDirection: "row",
            flexWrap: "nowrap",
            flexGrow: 1,
          }}
        >
          {/* <Box sx={{ flexGrow: 1 }}></Box> */}
          <Grid item size={{xs:0,sm:2,md:3}} sx={{ borderRight: '1px solid', borderColor: 'divider' }}>
            <ResponsiveDrawer
              handleDrawerClose={handleDrawerClose}
              handleDrawerTransitionEnd={handleDrawerTransitionEnd}
              mobileOpen={mobileOpen}
              drawerWidth={drawerWidth}
              theme={theme}
              handleTheme={handleTheme}
            />
          </Grid>

          <Grid item size={{xs:12,sm:10,md:6}}
            sx={{
              display: "flex",
              justifyContent: "center",
              backgroundColor: theme.palette.background.default,
              borderRight: '1px solid', 
              borderColor: 'divider',
              // هذا هو العمود الذي يجب أن يسمح بمرور التمرير
              minHeight: '200vh', // لضمان تمرير الصفحة بالكامل
              width: '100%',
            }}
          >
            <Outlet />
          </Grid>
          <Grid item size={{xs:0,sm:0,md:3}} >
            <SideBar />
          </Grid>
        </Grid>
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default Root;
