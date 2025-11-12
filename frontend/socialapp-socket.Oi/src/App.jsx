import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Root from "./Root";
import Home from "./pages/home/Home";
import LoadingPage from "./components/loadingPage";
import Err_404Page from "./components/NotFound-404";
import SignUpForm from "./pages/signin-signup/signup";
import LoginForm from "./pages/signin-signup/signin";
import UserProfilePage from "./pages/userprofile/userProfile";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import getDesignTokens from "./Api/theme/getDesignTokens";
// import { lightTheme, darkTheme } from "./pages/Api/Redux/theme/getDesignTokens"; // حسب إعدادك

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const mode = useSelector((state) => state.theme.mode);
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      errorElement: <Err_404Page />,
      children: [
        {
          index: true,
          element: isAuthenticated ? (
            <Home />
          ) : (
            <Navigate to="/signin" replace />
          ),
        },
        {
          path: "/user/:username",
          element: isAuthenticated ? (
            <UserProfilePage />
          ) : (
            <Navigate to="/" replace />
          ),
        },
        {
          path: "/signup",
          element: !isAuthenticated ? (
            <SignUpForm />
          ) : (
            <Navigate to="/" replace />
          ),
        },
        {
          path: "/signin",
          element: !isAuthenticated ? (
            <LoginForm />
          ) : (
            <Navigate to="/" replace />
          ),

        },
        {
          path:"*",
          element:<Err_404Page/>
        }
      ],
    },
  ]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} fallbackElement={<LoadingPage />} />
    </ThemeProvider>
  );
}

export default App;
