import React from "react";
import { useRouteError } from "react-router-dom";
import { Box, Typography, Button, useTheme } from "@mui/material";

const Err_404Page = () => {
  const error = useRouteError();
  const theme = useTheme();

  // 🔹 القيم الافتراضية لصفحة 404
  let title = "الصفحة غير موجودة";
  let detailMessage = "عذرًا، لم نتمكن من العثور على الصفحة التي تبحث عنها.";
  let statusDisplay = "404 🚫";

  // 🔹 التحقق من نوع الخطأ
  if (error) {
    const isCustomError = error.status && error.status !== 404;
    if (isCustomError) {
      statusDisplay = error.status || "خطأ";
      title = "حدث خطأ أثناء تحميل الصفحة 🛑";
      detailMessage =
        error.statusText ||
        error.message ||
        "حدث خطأ غير متوقع أثناء جلب البيانات.";
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        textAlign: "center",
        px: 3,
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontWeight: "bold",
          mb: 1,
          color: theme.palette.primary.main,
          fontSize: { xs: "4rem", sm: "6rem" },
        }}
      >
        {statusDisplay}
      </Typography>

      <Typography variant="h4" sx={{ mb: 2 }}>
        {title}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          mb: 4,
          maxWidth: "500px",
          color: theme.palette.text.secondary,
        }}
      >
        {detailMessage}
      </Typography>

      <Button
        variant="contained"
        onClick={() => (window.location.href = "/")}
        sx={{
          borderRadius: "20px",
          textTransform: "none",
          fontWeight: "bold",
          px: 3,
        }}
      >
        العودة إلى الصفحة الرئيسية
      </Button>
    </Box>
  );
};

export default Err_404Page;
