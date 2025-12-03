import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import React, { lazy, Suspense } from 'react';
import Root from "./Root";
import Home from "./pages/home/Home";
import LoadingPage from "./components/loadingPage";
import Err_404Page from "./components/NotFound-404";
import SignUpForm from "./pages/signin-signup/signup";
import LoginForm from "./pages/signin-signup/signin";
import UserProfilePage from "./pages/userprofile/userProfile";
import getDesignTokens from "./Api/theme/getDesignTokens";
import Notifications from "./pages/notifications/notifications";
import PostDetails from "./pages/postDetails/postDetails";
import ChatList from "./pages/chat/chatList";
import ChatDetail from "./pages/chat/chatDetails";
import FriendsList from "./pages/friends/friends";
import ForgotPassword from "./pages/resetPassword/forgetPassword";
import ResetPassword from "./pages/resetPassword/newPassword";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
function App() {
  // @ts-ignore
  const { isAuthenticated } = useSelector((state) => state.auth);
  // @ts-ignore
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
          path: "/user/friends",
          element: isAuthenticated ? (
            <FriendsList />
          ) : (
            <Navigate to="/signin" replace />
          ),
        },
        {
          path: "/Notifications",
          element: isAuthenticated ? (
            <Notifications />
          ) : (
            <Navigate to="/signin" replace />
          ),
        },
        {
          path: "/chatlist",
          element: isAuthenticated ? (
            <ChatList />
          ) : (
            <Navigate to="/signin" replace />
          ),
        },
        {
          path: "/chatdetails/:chatId",
          element: isAuthenticated ? (
            <ChatDetail />
          ) : (
            <Navigate to="/signin" replace />
          ),
        },
        {
          path: "/posts/:postId",
          element: isAuthenticated ? (
            <PostDetails />
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
          path: "/forget-password",
          element: !isAuthenticated ? (
            <ForgotPassword />
          ) : (
            <Navigate to="/" replace />
          ),

        },
        {
          path: "/reset-password/:token",
          element: !isAuthenticated ? (
            <ResetPassword />
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
