import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import Root from "./Root";
import Home from "./pages/home/Home";
import LoadingPage from "./components/loadingPage";
import Err_404Page from "./components/NotFound-404";
import SignUpForm from "./pages/signin-signup/signup";
import LoginForm from "./pages/signin-signup/signin";
import UserProfilePage  from "./pages/userprofile/userProfile";
import { useSelector } from "react-redux";
// import { lightTheme, darkTheme } from "./pages/Api/Redux/theme/getDesignTokens"; // حسب إعدادك

function App() {
    const {  isAuthenticated } = useSelector((state) => state.auth);
  // const { mode } = useSelector((state) => state.theme); // مثلا dark/light
  // const theme = mode === "dark" ? darkTheme : lightTheme;

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      errorElement: <Err_404Page />,
      children: [
        {
          index: true,
          element: isAuthenticated ? <Home /> : <Navigate to="/signin" replace />,
        }, 
        {
          path: "/:username",
          element: isAuthenticated ? <UserProfilePage  /> : <Navigate to="/" replace />,
        }, 
        {
          path: "/signup",
          element: !isAuthenticated ? <SignUpForm /> : <Navigate to="/" replace />,
        }, 
        {
          path: "/signin",
          element: !isAuthenticated ? <LoginForm /> : <Navigate to="/" replace />,
        }, 
      ],
    },
    
  ]);
  return (
    
    <RouterProvider router={router} fallbackElement={<LoadingPage />} />
  );
}

export default App;
