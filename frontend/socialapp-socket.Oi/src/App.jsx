import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import Root from "./Root";
import Home from "./pages/home/Home";
import LoadingPage from "./components/loadingPage";
import Err_404Page from "./components/NotFound-404";
import SignUpForm from "./pages/Api/signup";
import LoginForm from "./pages/Api/signin";
import { useSelector } from "react-redux";

function App() {
    const {  isAuthenticated } = useSelector((state) => state.auth);

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
