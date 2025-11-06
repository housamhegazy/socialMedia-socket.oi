import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./Root";
import Home from "./pages/home/Home";
import LoadingPage from "./components/loadingPage";
import Err_404Page from "./components/NotFound-404";
import SignUpForm from "./pages/Api/signup";
import LoginForm from "./pages/Api/signin";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      Component: Root,
      errorElement: <Err_404Page />,
      children: [
        {
          index: true,
          Component: Home,
          HydrateFallback: LoadingPage, // شاشة التحميل داخل الكومبوننت نفسه حتى لا تظهر شاشه بيضاء
        }, 
        {
          path: "/signup",
          Component: SignUpForm,
          HydrateFallback: LoadingPage, // شاشة التحميل داخل الكومبوننت نفسه حتى لا تظهر شاشه بيضاء
        }, 
        {
          path: "/signin",
          Component: LoginForm,
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
