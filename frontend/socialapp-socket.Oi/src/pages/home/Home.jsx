import Box from "@mui/material/Box/";
import PostComposer from "./postcomposer";
import GetPosts from "./getPosts";
import { useEffect, useState } from "react";
import { useGetUserByNameQuery } from "../Api/Redux/userApi"; // Your RTK Query hook


const Home = () => {
  //get posts states
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  //send posts states
  const [postText, setPostText] = useState(""); // post text
  const [loadingPreview, setLoadingPreview] = useState(false); // loading preview box
  const [file, setFile] = useState(null); // save image to send to db
  const [preview, setPreview] = useState(null); // save image in preview in page
  const [isPosting, setIsPosting] = useState(false); // loading during post tweet (for button loading)
  const [errorMessage, setErrorMessage] = useState(null); // error message
  const {
    data: user, 
    isLoading: userLoading,
    refetch, // ✅ استخراج دالة refetch هنا
    isError,
  } = useGetUserByNameQuery(); // Fetch current user

  {user && console.log("user fetched "  , user);}
  //======================================= get posts function ====================================================
  const handleGetPosts = async () => {

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/posts`, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        console.log("data fetched successfully");
        setPosts(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    handleGetPosts();
  }, []);
  //========================== save image to preview and in file to send it to backend  =================================
  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    setFile(file);
    setLoadingPreview(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      // 4. تعيين المسار المؤقت (Data URL) كقيمة للمعاينة
      setPreview(reader.result);
      setLoadingPreview(false);
    };
    reader.onerror = () => {
      // 5. التعامل مع الخطأ (إذا فشلت القراءة)
      console.error("FileReader failed to read the file.");
      setLoadingPreview(false);
      // يمكنك إضافة رسالة خطأ للمستخدم هنا
    };
    // 6. ⭐️ قراءة الملف كـ Data URL
    reader.readAsDataURL(file);
  };
  //==============================send posts to database=========================================================
  const handlePost = async () => {
    setErrorMessage(null);
    if (!postText.trim() && !file) {
      setErrorMessage("Please enter text or select an image to post.");
      return;
    }

    setIsPosting(true);
    const formData = new FormData();
    formData.append("text", postText.trim()); // إضافة النص

    if (file) {
      formData.append("image", file);
    }

    try {
      const response = await fetch(`http://localhost:3000/api/posts`, {
        method: "POST",
        body: formData,
        // credentials:"include"
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Post creation failed:", errorData);
        setErrorMessage(
          errorData.message ||
            `Post creation failed with status: ${response.status}`
        );
        return;
      }
      const data = await response.json();
      console.log("data send successfully", data);
      handleGetPosts();
      setPostText("");
      setFile(null);
      setPreview(null);
      setErrorMessage("Post uploaded successfully!");
    } catch (error) {
      console.error("Network or fetch error:", error);
      setErrorMessage("Failed to connect to the server.");
    } finally {
      setIsPosting(false);
    }
  };

  //==========================================remove preview====================================
  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
  };
  return (
    <Box sx={{ width: "100%" }}>
      <PostComposer
        {...{
          postText,
          preview,
          setPostText,
          handleRemoveImage,
          loadingPreview,
          isPosting,
          handlePost,
          handleImage,
          errorMessage,
          file,
        }}
      />
      <GetPosts {...{ posts, loading }} />
    </Box>
  );
};

export default Home;
