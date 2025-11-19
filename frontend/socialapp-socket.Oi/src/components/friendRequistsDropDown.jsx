import React, { useState } from "react";
import {
  Badge,
  Button,
  Menu,
  MenuItem,
  Avatar,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  GroupAdd,
  Done,
  Close,
  Person,
  NotificationAdd,
} from "@mui/icons-material";
import {
  // تم تصحيح مسار الاستيراد ليتطابق مع مكان ملف API (تمت إزالة نقطة واحدة من الترحيل)
  useGetPendingRequestsQuery,
  useAcceptRequestMutation,
} from "../Api/friendRequistApi/friendRequistApi";

// المكون الرئيسي لعرض طلبات الصداقة
const FriendRequestsDropdown = () => {
  // حالة لتثبيت القائمة المنسدلة
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // 1. جلب طلبات الصداقة المعلقة باستخدام RTK Query
  const {
    data: pendingRequests = [],
    isLoading,
    isError,
  } = useGetPendingRequestsQuery();
  // 2. Mutation لقبول الطلب
  const [acceptRequest, { isLoading: isAccepting }] =
    useAcceptRequestMutation();

  // معالج فتح القائمة
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // معالج إغلاق القائمة
  const handleClose = () => {
    setAnchorEl(null);
  };

  // معالج قبول الطلب
  const handleAccept = async (requestId, senderUsername) => {
    try {
      // تنفيذ الـ mutation
      await acceptRequest(requestId).unwrap();

      // يفضل استخدام مكتبة مثل SweetAlert2 لعرض رسالة نجاح
      console.log(`تم قبول طلب الصداقة من ${senderUsername}`);
    } catch (error) {
      console.error("فشل في قبول الطلب:", error);
      // عرض رسالة خطأ
    }
  };

  // يُفترض أن الـ API يعيد فقط الطلبات الـ Pending الموجهة للمستخدم الحالي
  const requestsCount = pendingRequests.length;

  return (
    <Box sx={{ ml: 2, display: "flex", alignItems: "center" }}>
      {/* زر فتح القائمة */}
      <Button
        id="requests-button"
        aria-controls={open ? "requests-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        variant="contained"
        color="primary"
        sx={{
          px: { xs: 0.5 },
          borderRadius: 2,
          fontWeight: "bold",
          p: "8px 16px",
          minWidth: 150,
          // backgroundColor: requestsCount > 0 ? "#ff9800" : "primary.main", // لون مميز عند وجود طلبات
          // "&:hover": {
          //   backgroundColor: requestsCount > 0 ? "#e68a00" : "primary.dark",
          // },
        }}
        startIcon={<GroupAdd />}
      >
        <Badge badgeContent={requestsCount} color="error">
          <NotificationAdd />
        </Badge>
        
      </Button>

      {/* القائمة المنسدلة (Menu) */}
      <Menu
        id="requests-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "requests-button",
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          mt: 1,
          ".MuiPaper-root": {
            minWidth: 300,
            maxWidth: 400,
            borderRadius: 2,
            boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
          },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            p: 2,
            fontWeight: 700,
            color: "primary.main",
            textAlign: "right",
          }}
        >
          friend requists ({requestsCount})
        </Typography>
        <Divider />

        {/* حالة التحميل */}
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2, gap: 1 }}>
            <CircularProgress size={24} />
            <Typography sx={{ mr: 1 }}>جاري التحميل...</Typography>
          </Box>
        )}

        {/* حالة عدم وجود طلبات */}
        {!isLoading && requestsCount === 0 && !isError && (
          <MenuItem onClick={handleClose} disabled>
            <ListItemText
              sx={{ textAlign: "right" }}
              primary="لا يوجد طلبات صداقة معلقة."
            />
          </MenuItem>
        )}

        {/* حالة الخطأ */}
        {isError && (
          <MenuItem onClick={handleClose}>
            <ListItemText
              sx={{ textAlign: "right", color: "error.main" }}
              primary="حدث خطأ في جلب الطلبات."
            />
          </MenuItem>
        )}

        {/* عرض قائمة الطلبات */}
        {pendingRequests.map((request) => (
          <MenuItem
            key={request._id}
            sx={{
              gap: 1,
              py: 1.5,
              // استخدام Flexbox لعكس الترتيب في الـ RTL
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Avatar
                src={request.sender?.profilePicture || ""}
                alt={request.sender?.username}
              >
                <Person />
              </Avatar>
            </ListItemIcon>

            <ListItemText
              primary={request.sender?.username || "مستخدم مجهول"}
              secondary={`أرسل لك طلب صداقة.`}
              primaryTypographyProps={{ fontWeight: 600 }}
              // النص الرئيسي على اليمين في الـ RTL
              sx={{ textAlign: "right", mr: 2, flexGrow: 1 }}
            />

            {/* زر قبول الطلب */}
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() =>
                handleAccept(request._id, request.sender?.username)
              }
              disabled={isAccepting}
              sx={{
                borderRadius: 5,
                whiteSpace: "nowrap",
                minWidth: 90,
              }}
              startIcon={
                isAccepting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Done />
                )
              }
            >
              قبول
            </Button>

            {/* زر الرفض (إضافة بسيطة) */}
            <Button
              variant="outlined"
              color="error"
              size="small"
              sx={{ borderRadius: 5, minWidth: 60, ml: 1 }}
              // يجب إضافة معالج لـ handleReject لاحقًا
              // onClick={() => handleReject(request._id)}
            >
              <Close fontSize="small" />
            </Button>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default FriendRequestsDropdown;
