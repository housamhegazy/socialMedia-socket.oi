import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./Root";
import Home from "./pages/home/Home";
import FetchingdataLoader from "./components/loadingPage";
import Err_404Page from "./components/NotFound-404";
import SignUpForm from "./pages/signup/signup";
import LoginForm from "./pages/signup/signin";

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
          HydrateFallback: FetchingdataLoader, // شاشة التحميل داخل الكومبوننت نفسه حتى لا تظهر شاشه بيضاء
        }, 
        {
          path: "/signup",
          Component: SignUpForm,
          HydrateFallback: FetchingdataLoader, // شاشة التحميل داخل الكومبوننت نفسه حتى لا تظهر شاشه بيضاء
        }, 
        {
          path: "/signin",
          Component: LoginForm,
          HydrateFallback: FetchingdataLoader, // شاشة التحميل داخل الكومبوننت نفسه حتى لا تظهر شاشه بيضاء
        }, 
      ],
    },
  ]);
  return (
    <RouterProvider router={router} fallbackElement={<FetchingdataLoader />} />
  );
}

export default App;
