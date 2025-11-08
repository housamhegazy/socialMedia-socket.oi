import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import Root from "./Root";
import Home from "./pages/home/Home";
import LoadingPage from "./components/loadingPage";
import Err_404Page from "./components/NotFound-404";
import SignUpForm from "./pages/Api/signup";
import LoginForm from "./pages/Api/signin";
import { useSelector } from "react-redux";
import { useGetUserByNameQuery } from "./pages/Api/Redux/userApi";

function App() {
    const {  isAuthenticated } = useSelector((state) => state.auth);
      // const {
      //   isLoading: userLoading,
      // } = useGetUserByNameQuery(); // Fetch current user
    
    
  // لو لسه بنشيّك حالة اليوزر من الـ API، نظهر شاشة تحميل
  // if (userLoading) {
  //   return <LoadingPage />;
  // }
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      errorElement: <Err_404Page />,
      children: [
        {
          index: true,
          element: isAuthenticated ? <Home /> : <Navigate to="/signin" replace />,
          HydrateFallback: LoadingPage, // شاشة التحميل داخل الكومبوننت نفسه حتى لا تظهر شاشه بيضاء
        }, 
        {
          path: "/signup",
          element: !isAuthenticated ? <SignUpForm /> : <Navigate to="/" replace />,
          HydrateFallback: LoadingPage, // شاشة التحميل داخل الكومبوننت نفسه حتى لا تظهر شاشه بيضاء
        }, 
        {
          path: "/signin",
          element: !isAuthenticated ? <LoginForm /> : <Navigate to="/" replace />,
          HydrateFallback: LoadingPage, // شاشة التحميل داخل الكومبوننت نفسه حتى لا تظهر شاشه بيضاء
        }, 
      ],
    },
    
  ]);
  return (
    <RouterProvider router={router} fallbackElement={<LoadingPage />} />
  );
}

export default App;
