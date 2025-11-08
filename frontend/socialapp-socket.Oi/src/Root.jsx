import {
  Box,
  createTheme,
  CssBaseline,
  Grid,
  ThemeProvider,
} from "@mui/material";
import AppBarComponent from "./components/AppBar";
import { Outlet, useNavigate } from "react-router";
import Footer from "./components/Footer";
import ResponsiveDrawer from "./components/Drawer";
import { useEffect, useMemo, useState } from "react";
import getDesignTokens from "./styles/theme";
import SideBar from "./components/SideBar";
import { useGetUserByNameQuery } from "./pages/Api/Redux/userApi"; // Your RTK Query hook
import { useDispatch, useSelector } from "react-redux";
import {
  setAuthUser,
  clearAuthUser,
  setLoadingAuth,
} from "./pages/Api/Redux/authSlice";
import LoadingPage from "./components/loadingPage";

// const drawerWidth = 200;
// const sidebarWidth = 280;
const ContainerMaxWidth = 1200;
const Root = () => {
  //open and close drawer functions
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  // import data from api only here and update it in authslice to all website
  const {
    data: apiuser,
    isLoading: userLoading,
    isError,
  } = useGetUserByNameQuery(); // Fetch current user
  //import user from auth slice to control drawer and sidebar
  const { user, isAuthenticated, isLoadingAuth } = useSelector(
    (state) => state.auth
  );
  useEffect(() => {
    dispatch(setLoadingAuth(true));
    if (userLoading) return; // لسه بيجيب من السيرفر
    if (apiuser) {
      dispatch(setAuthUser(apiuser));
    } else if (isError) {
      dispatch(clearAuthUser());
    }
    dispatch(setLoadingAuth(false));
  }, [apiuser, userLoading, isError, dispatch]);

  // loading whene userloading
  if (userLoading) {
    return <LoadingPage />;
  }

  // loading whene logpout and navigate to signin 
  // if (!isAuthenticated && !window.location.pathname.includes("/signin")) {
  //   return <LoadingPage />;
  // }
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
            minHeight: user ? "200vh" : `calc(100vh - 64px)`,
            flexWrap: "nowrap",
            alignItems: "stretch",
          }}
        >
          {isAuthenticated && (
            <Grid
              size={{ xs: 0, sm: 2, md: 3 }}
              sx={{
                // border: "1px solid",
                // borderColor: "divider",
                flexShrink: 0,
                position: "sticky",
                top: "64px",
                height: "100vh",
                backgroundColor: theme.palette.background.default,
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
          )}
          <Grid
            size={isAuthenticated ? { xs: 12, sm: 10, md: 6 } : 12}
            sx={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: theme.palette.background.default,
              borderRight: "1px solid",
              borderLeft: "1px solid",
              borderColor: "divider",
              flexGrow: 1,
              minHeight: "calc(100vh - 64px)",
            }}
          >
            <Outlet />
          </Grid>
          {isAuthenticated && (
            <Grid
              size={{ xs: 0, sm: 0, md: 3 }}
              sx={{
                position: "sticky",
                top: "64px",
                height: "100vh",
                backgroundColor: theme.palette.background.default,
              }}
            >
              <SideBar />
            </Grid>
          )}
        </Grid>
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default Root;
