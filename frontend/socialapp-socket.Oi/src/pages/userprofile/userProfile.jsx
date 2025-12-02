import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Button,
  Box,
  IconButton,
  CircularProgress,
  ListItemIcon,
  Menu,
  MenuItem,
  useTheme,
  Tooltip,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import LoadingPage from "../../components/loadingPage";
import CardComponent from "../home/cardComponent";
import {
  useDeleteAllPostsMutation,
  useGetUserPostsQuery,
} from "../../Api/posts/postsApi";
import {
  useDeletemyAccountMutation,
  useGetUserByUserNameQuery,
  useUpdateAvatarMutation,
  useUpdateCoverMutation,
} from "../../Api/user/userApi";
import Err_404Page from "../../components/NotFound-404";
import { useDispatch, useSelector } from "react-redux";
import {
  Close,
  DeleteForever,
  Done,
  Edit,
  MoreVert,
  PersonAdd,
  Pin,
} from "@mui/icons-material";
// import ProfileMenu from "../home/menuComponent";
import Swal from "sweetalert2";
import PostComposer from "../home/createPost";
import { useCreateChatMutation } from "../../Api/chatApi/chatApi";
import {
  useAcceptRequestMutation,
  useCancelFriendRequistMutation,
  useGetFriendshipStatusQuery,
  useRemoveFriendMutation,
  useSendRequistMutation,
} from "../../Api/friendRequistApi/friendRequistApi";
import { clearAuthUser } from "../../Api/user/authSlice";

const UserProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  // ==================== get user data from backend and compare it with current user ===========================================
  const { username } = useParams();
  //=======================================بيانات المستخدم الحالي اللي مسجل دخول===========================================
  const { user: currentUser, isLoadingAuth } = useSelector(
    // @ts-ignore
    (state) => state.auth
  );
  console.log(currentUser);
  const isMyProfile = username === currentUser?.username; //  التحقق من ان اسم المستخدم ده هو نفسه المستخدم المسجل دخول
  //==============================  بيانات المستخدم اللي حابب افتح صفحته================================================
  const {
    data: profile,
    isLoading: userLoading,
    isError: userError,
  } = useGetUserByUserNameQuery(username, {
    skip: isMyProfile, // لو هو نفس المستخدم، ما تبعتش request
  });
  // لو اليوزر هو نفسه المستخدم الحالي
  const userProfile = isMyProfile ? currentUser : profile;
  //========================================= Get posts from backend ===============================================
  const { data: posts = [], isLoading: postsLoading } = useGetUserPostsQuery(
    userProfile?._id, // أو user.username حسب API
    { skip: !userProfile } // تجاهل الـ query حتى يكون user موجود
  );
  //============================ import delete all posts from posts api ===========================================
  const [deleteAllPosts] = useDeleteAllPostsMutation();
  //================================ create chat ====================================================================
  const [deleteMyProfile] = useDeletemyAccountMutation();
  const [createChat] = useCreateChatMutation();
  // ====================================== error state =================================================
  const [error, setError] = useState(null); //error message
  const [loadingDelete, setLoadingdelete] = useState(false);
  //============================ main menu state =====================================
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  //======================================== edit avatar states ======================================
  const [loadingPreview, setLoadingPreview] = useState(false); // loading preview box
  const [file, setFile] = useState(null); // save image to send to db
  const [preview, setPreview] = useState(null); // save image in preview in page
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cover, setCover] = useState(null);
  const [coverPreview,setCoverPreview] = useState(null)
  const [uploadingCover, setUploadingCover] = useState(false);
  //=============================== import update avatar ======================================
  const [updateAvatar] = useUpdateAvatarMutation();
  //=============================== import update cover ======================================
  const [updateCover] = useUpdateCoverMutation();
  //================================== send frien requist =======================================
  const [sendFriendRequist, { isLoading: loadingRequist }] =
    useSendRequistMutation();

  //============================================== remove friend ===========================================================
  const [removeFriend] = useRemoveFriendMutation();
  //============================================= accept friend requist ==============================================
  const [acceptRequest] = useAcceptRequestMutation();
  //====================================CANCEL FRIEND REQUIST ===========================================================================
  const [cancelRequest] = useCancelFriendRequistMutation();
  //======================== الحصول على حالة الارسال هل تم الارسال ام لا وتظهر للمرسل بنحدد منها شكل الزرارا بتاع ارسال طلب الصداقه ====================================
  const { data: friendshipStatus } = useGetFriendshipStatusQuery(
    userProfile?._id,
    {
      skip: !userProfile || isMyProfile,
    }
  ); // تجاوز إذا لم يكن هناك ملف شخصي أو كان الملف الخاص بك)

  // حالة الطلب المرسل محلياً (لتغيير الزر فوراً)==============
  const [requestSent, setRequestSent] = useState(false);
  // ======================= تحديد الحالة الأولية ==============
  useEffect(() => {
    if (
      friendshipStatus &&
      friendshipStatus.status === "Pending" &&
      friendshipStatus.direction === "Sent"
    ) {
      setRequestSent(true); // إذا كان هناك طلب مرسل بالفعل، اضبط الحالة المحلية
    }
  }, [friendshipStatus]);
  // =================================== دالة عرض الزر بناءً على الحالة ===================================
  const getFriendButtonState = () => {
    const status = friendshipStatus?.status;
    const direction = friendshipStatus?.direction;
    const requestId = friendshipStatus?.requestId;

    // 1. إذا كان طلب معلّق (مرسل من المستخدم الحالي) أو تم إرساله للتو
    if ((status === "Pending" && direction === "Sent") || requestSent) {
      return {
        text: "remove requist",
        disabled: false,
        icon: <Done />,
        color: "inherit",
        handler: () => cancelFriendRequist(),
      };
    }

    // 2. إذا كان صديقاً بالفعل
    if (status === "Friends") {
      return {
        text: "remove friend",
        disabled: false,
        icon: <Done />,
        color: "success",
        handler: () => handleUnfriend(),
      };
    }

    // 3. إذا كان طلب معلّق (وارد للمستخدم الحالي)
    if (status === "Pending" && direction === "Received" && requestId) {
      // هذا سيتطلب زراً آخر لـ 'قبول/رفض'
      return {
        text: "accept requist",
        disabled: false,
        icon: <Done />,
        color: "info",
        handler: () => handleAcceptRequest(requestId, userProfile.username), // 💡 تمرير الـ ID والـ Handler
      };
    }

    // 4. الحالة الافتراضية (لا يوجد علاقة)
    return {
      text: " Add friend",
      disabled: loadingRequist,
      icon: <PersonAdd />,
      color: "primary",
      handler: () => handleSendFriendRequist(),
    };
  };
  const buttonState = getFriendButtonState(); // جلب حالة الزر

  //=========================================================================================================================================
  //=================================================== functions ==============================================================================
  //============================================================================================================================================
  //========================================== delete all posts =========================================
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        await deleteAllPosts().unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Delete failed:", error);
        Swal.fire({
          title: "Error!",
          text:
            error?.data?.message ||
            "Something went wrong while deleting the post.",
          icon: "error",
        });
      }
    }
  };
  //============================================== upload avatar ===========================================================
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
  //============================================== upload cover ===========================================================
  const handleCover = async (e) => {
    const coverFile = e.target.files[0];
    if (!coverFile) {
      return;
    }
    setCover(coverFile); // لارسالها للباك اند
    
    // الباقي دي عشان نعرضها في الصفحه قبل الارسال
    const reader = new FileReader();
    reader.onloadend = () => {
    //   // 4. تعيين المسار المؤقت (Data URL) كقيمة للمعاينة
      setCoverPreview(reader.result);
      setUploadingCover(false);
    };
    reader.onerror = () => {
    //   // 5. التعامل مع الخطأ (إذا فشلت القراءة)
      console.error("FileReader failed to read the file.");
      setLoadingPreview(false);
    //   // يمكنك إضافة رسالة خطأ للمستخدم هنا
    };
    // 6. ⭐️ قراءة الملف كـ Data URL
    reader.readAsDataURL(coverFile);
  };
  //========================================================== edit avatar==========================================
  const handleEditeAvatar = async () => {
    if (!file) return;
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", file); // ✨ لازم نفس الاسم اللي السيرفر مستنيّه
    try {
      await updateAvatar(formData).unwrap();
      Swal.fire({
        icon: "success",
        title: "تم تحديث الصورة بنجاح!",
        timer: 1500,
        showConfirmButton: false,
      });
      handleRemoveImage();
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "حدث خطأ!",
        text: error.message || "لم يتم رفع الصورة.",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };
  //============================================ send cover to database ==========================================
  const handleCoverPhoto = async () => {
    if (!cover) return;
    setUploadingCover(true);
    const formData = new FormData();
    formData.append("cover", cover); // ✨ لازم نفس الاسم اللي السيرفر مستنيّه
    try {
      await updateCover(formData).unwrap();
      
      Swal.fire({
        icon: "success",
        title: "تم تحديث الصورة بنجاح!",
        timer: 1500,
        showConfirmButton: false,
      });
      // ⚠️ مهم: إزالة المعاينة بعد الرفع الناجح
      setCover(null);
      setCoverPreview(null)
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "حدث خطأ!",
        text: error.message || "لم يتم رفع الصورة.",
      });
    } finally {
      setUploadingCover(false);
      
    }
  };
  //==========================================remove preview====================================
  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
  };
  //======================================== delete all posts menu btn ===============================

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteFunc = () => {
    handleClose();
    if (handleDelete) handleDelete();
  };
  //=========================================== handleSendmessage =========================================

  const handleSendmessage = async () => {
    try {
      const newChat = await createChat({
        receiverId: userProfile._id,
      }).unwrap();
      navigate(`/chatdetails/${newChat._id}`);
    } catch (error) {
      console.log(error);
    }
  };

  //======================================== send friend requist ====================================
  const handleSendFriendRequist = async () => {
    try {
      await sendFriendRequist({ receiverId: userProfile._id }).unwrap();
      setRequestSent(true);
      Swal.fire({
        icon: "success",
        title: "تم إرسال طلب الصداقة!",
        text: `@${userProfile.username} سيتم إشعاره بالطلب.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "فشل الإرسال!",
        text: error.data?.message || "حدث خطأ أثناء إرسال الطلب.",
      });
      setRequestSent(false); // إعادة الحالة إذا فشل الإرسال
    }
  };
  //====================================== remove friend =========================================
  const handleUnfriend = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        await removeFriend(userProfile._id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: `Your friend ${userProfile.username} has been removed.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("فشل في حذف الصديق:", error);
        Swal.fire({
          title: "Error!",
          text:
            error?.data?.message ||
            "Something went wrong while deleting the post.",
          icon: "error",
        });
      }
    }
  };

  //=================================== accept requist ==============================================
  const handleAcceptRequest = async (requistId, senderUsername) => {
    try {
      await acceptRequest(requistId).unwrap();
      Swal.fire({
        icon: "success",
        title: `أنت الآن صديق لـ ${senderUsername}!`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "فشل القبول!",
        text: error.data?.message || "حدث خطأ أثناء قبول الطلب.",
      });
    }
  };
  //==================================== CANCEL requist ==============================================
  const cancelFriendRequist = async () => {
    try {
      await cancelRequest(userProfile._id).unwrap();
      setRequestSent(false);
      Swal.fire({
        icon: "success",
        title: "requist cancelled",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "فشل القبول!",
        text: error.data?.message || "حدث خطأ أثناء قبول الطلب.",
      });
    }
  };
  //=================================================== delete my account ==========================
  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete account!",
    });
    if (result.isConfirmed) {
      setLoadingdelete(true);
      try {
        await deleteMyProfile().unwrap();
        Swal.fire({
          title: "Deleted!",
          text: `Your account has been deleted`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        // امسح الداتا من الستور
        dispatch(clearAuthUser());
        // اعمل redirect
        navigate("/signin");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "something error",
          text: error?.message || "something error , try again later",
        });
      } finally {
        setLoadingdelete(false);
      }
    }
  };
  //========================================================== handleCoverPhoto =================================================

  useEffect(() => {
    if (userError) {
      setError("User not found");
    }
  }, [userError]);

  if (error) {
    return <Err_404Page />;
  }
  if (userLoading || postsLoading || isLoadingAuth) return <LoadingPage />;

  if (userError || !userProfile) {
    return <div>User not found</div>;
  }

  if (userError) {
    return <Err_404Page />; // عرض صفحة الخطأ إذا كان المستخدم غير موجود
  }
  return (
    <Box maxWidth="lg" sx={{ px: 0 }}>
      {/* صفحة المستخدم */}
      <Grid container spacing={4} sx={{ p: 0 }}>
        {/* قسم معلومات المستخدم */}
        <Grid sx={{ width: "100%" }}>
          <Paper
            elevation={3}
            sx={{
              // padding: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              backgroundImage: `url(${
                isMyProfile
                  ? currentUser?.coverPhoto
                  : userProfile?.coverPhoto
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              minHeight: "400px",
              borderRadius: "0 0 20px 20px",
              position: "relative",
              boxShadow:
                theme.palette.mode === "dark"
                  ? `0 0px 30px rgba(0, 0, 0, 0.5), inset 0 -100px 50px -50px rgb(21, 21, 21)`
                  : `0 0px 30px rgba(255, 255, 255, 0.5), inset 0 -100px 50px -50px rgba(255, 255, 255, 1)`,
            }}
          >
            {coverPreview && <img src={coverPreview} width={"100%"} height={"100%"} style={{zIndex:"1000",position:"absolute"}}/>}
            

            {/* ==================================== edit cover =============================================== */}
            {isMyProfile && (
              <>
                {/* ======================= 1. زر التعديل (Edit) ======================= */}
                {/* يظهر دائماً ويفتح نافذة اختيار الملف */}
                <Tooltip title="تعديل الغلاف" arrow placement="top">
                  <IconButton
                    component="label" // يجعل الـ IconButton يعمل كـ Label للـ Input المخفي
                    sx={{
                      position: "absolute",
                      bottom: "20px",
                      right: "20px", // ⭐️ وضعنا زر التعديل على اليمين ⭐️
                      zIndex: "1000",
                      bgcolor: "background.paper",
                      color: "text.primary",
                      boxShadow: 3,
                      "&:hover": { bgcolor: "grey.200" },
                    }}
                    size="small"
                    disabled={uploadingCover}
                  >
                    <Edit fontSize="small" />
                    <input
                      onChange={handleCover}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      disabled={uploadingCover}
                    />
                  </IconButton>
                </Tooltip>

                {/* ======================= 2. أزرار التأكيد والإلغاء (Confirm/Cancel) ======================= */}
                {/* تظهر فقط عند وجود ملف جديد جاهز للرفع */}
                {cover && (
                  <>
                    {/* زر التأكيد (Done) */}
                    <Tooltip title="حفظ الغلاف" arrow placement="top">
                      <IconButton
                        onClick={handleCoverPhoto}
                        disabled={uploadingCover}
                        sx={{
                          position: "absolute",
                          bottom: "20px",
                          left: "20px", // ⭐️ زر التأكيد على اليسار ⭐️
                          zIndex: "1000",
                          bgcolor: "success.main",
                          color: "#fff",
                          boxShadow: 3,
                          "&:hover": { bgcolor: "success.dark" },
                        }}
                        size="small"
                      >
                        {uploadingCover ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <Done fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>

                    {/* زر الإلغاء (Cancel) */}
                    <Tooltip title="إلغاء التعديل" arrow placement="top">
                      <IconButton
                        onClick={() => {
                          setCover(null)
                          setCoverPreview(null)
                        }} // ⭐️ افترض أن لديك دالة setCover لتصفير الحالة ⭐️
                        disabled={uploadingCover}
                        sx={{
                          position: "absolute",
                          bottom: "20px",
                          left: "60px", // ⭐️ بجوار زر التأكيد ⭐️
                          zIndex: "1000",
                          bgcolor: "error.main",
                          color: "#fff",
                          boxShadow: 3,
                          "&:hover": { bgcolor: "error.dark" },
                        }}
                        size="small"
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </>
            )}

            {/* ================================= user avatar ============================================= */}
            <Box
              sx={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* الصورة أو اللودينج */}
              <Box sx={{ position: "relative" }}>
                {loadingPreview ? (
                  <Box
                    sx={{
                      width: 150,
                      height: 150,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      border: "2px solid #ddd",
                      bgcolor: "rgba(0,0,0,0.05)",
                    }}
                  >
                    <CircularProgress size={40} />
                  </Box>
                ) : (
                  <Avatar
                    src={preview || userProfile?.avatar}
                    alt={userProfile?.name}
                    sx={{
                      width: { xs: 100, sm: 150 },
                      height: { xs: 100, sm: 150 },
                      mb: 2,
                      border: "3px solid #eee",
                      boxShadow: 3,
                      transition: "0.3s",
                      "&:hover": {
                        transform: isMyProfile ? "scale(1.03)" : "none",
                      },
                    }}
                  />
                )}

                {/* أيقونات التحرير والتأكيد */}
                {isMyProfile && !loadingPreview && (
                  <>
                    <IconButton
                      component="label"
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        bgcolor: "background.paper",
                        boxShadow: 3,
                        border: "1px solid #ccc",
                        "&:hover": { bgcolor: "primary.main", color: "#fff" },
                      }}
                      size="small"
                      disabled={uploadingAvatar}
                    >
                      <Edit fontSize="small" />
                      <input
                        onChange={handleImage}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        disabled={uploadingAvatar}
                      />
                    </IconButton>

                    {preview && (
                      <IconButton
                        onClick={handleEditeAvatar}
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          left: 8,
                          bgcolor: "success.main",
                          color: "#fff",
                          "&:hover": { bgcolor: "success.dark" },
                        }}
                        size="small"
                      >
                        {uploadingAvatar ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <Done fontSize="small" />
                        )}
                      </IconButton>
                    )}
                  </>
                )}
              </Box>
            </Box>

            {/* ====================================== end user avatar =================================================== */}
            <Typography variant="h6" color="white">
              {userProfile.name}
            </Typography>
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ marginBottom: 2 }}
            >
              @{userProfile.username}
            </Typography>
            {/* <Typography
              variant="body2"
              color="textSecondary"
              sx={{ marginBottom: 2 }}
            >
              Email: {userProfile.email}
            </Typography> */}
          </Paper>
        </Grid>
        {/* ====================================================buttons =============================================== */}
        {isMyProfile && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Button
              onClick={() => {
                navigate("/user/friends");
              }}
              variant="outlined"
              color="inherit"
              fullWidth
              sx={{
                marginBottom: 2,
                textTransform: "none",
                width: "150px",
              }}
            >
              my friends
            </Button>
            <Button
              onClick={() => {
                handleDeleteAccount();
              }}
              variant="contained"
              color="error"
              fullWidth
              sx={{
                marginBottom: 2,
                textTransform: "none",
                width: "150px",
              }}
            >
              {loadingDelete ? "deleting ... " : "delete account"}
            </Button>
          </Box>
        )}

        {!isMyProfile && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <Button
              onClick={buttonState.handler}
              variant="contained"
              // @ts-ignore
              color={buttonState.color}
              startIcon={
                loadingRequist ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  buttonState.icon
                )
              }
              disabled={buttonState.disabled || loadingRequist}
              sx={{
                borderRadius: "2rem",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
              }}
            >
              {buttonState.text}
            </Button>
            <Button
              onClick={() => {
                handleSendmessage();
              }}
              variant="contained"
              color="primary"
              // startIcon=<Message />
              sx={{
                borderRadius: "2rem",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
              }}
            >
              Send message
            </Button>
          </Box>
        )}
        {/*===================================== قسم المنشورات ========================================================*/}
        {/* create post */}
        {isMyProfile && <PostComposer user={currentUser} />}
        <Grid sx={{ width: "100%" }}>
          <Paper elevation={3} sx={{ width: "100%" }}>
            {posts?.length > 0 && (
              <>
                {isMyProfile && (
                  <Box style={{ display: "flex", justifyContent: "flex-end" }}>
                    <>
                      <IconButton
                        aria-label="settings"
                        onClick={handleClick}
                        sx={{
                          color: "text.secondary",
                          "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                        }}
                      >
                        <MoreVert />
                      </IconButton>

                      <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        disableScrollLock={true}
                        PaperProps={{
                          sx: {
                            mt: 1,
                            minWidth: 60,
                            borderRadius: 2,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          },
                        }}
                      >
                        {isMyProfile ? (
                          <MenuItem
                            onClick={handleDeleteFunc}
                            sx={{ color: "error.main" }}
                          >
                            <ListItemIcon>
                              <DeleteForever fontSize="small" color="error" />
                            </ListItemIcon>
                            <Typography variant="body2">delete all</Typography>
                          </MenuItem>
                        ) : (
                          <MenuItem sx={{ color: "text.main" }}>
                            <ListItemIcon>
                              <PersonAdd fontSize="small" color="inherit" />
                            </ListItemIcon>
                            <Typography variant="body2">follow</Typography>
                          </MenuItem>
                        )}
                      </Menu>
                    </>
                  </Box>
                )}
              </>
            )}

            {posts.length === 0 && (
              <Box>
                <Typography
                  sx={{ textAlign: "center" }}
                  variant="body1"
                  color="inherit"
                >
                  {isMyProfile
                    ? "you dont create any posts yet , what is in your minde ?"
                    : `no posts for ${profile.name}`}
                </Typography>
              </Box>
            )}
            {posts?.map((post) => (
              <CardComponent
                post={post}
                key={post?._id}
                isMyProfile={isMyProfile}
              />
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
export default UserProfilePage;
