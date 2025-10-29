import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./Root";
import Home from "./pages/Home";
import FetchingdataLoader from "./components/loadingPage";
import Err_404Page from "./components/NotFound-404";

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
        }, // <--- إضافة الـ loader هنا أيضًا
      ],
    },
  ]);
  return (
    <RouterProvider router={router} fallbackElement={<FetchingdataLoader />} />
  );
}

export default App;
