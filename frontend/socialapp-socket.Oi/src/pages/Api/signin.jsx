import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  CssBaseline,
  Avatar,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  LockOpenOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material"; // تم تغيير الأيقونة إلى LockOpen
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router";
import { useGetUserByNameQuery } from "../Api/Redux/userApi"; // Your RTK Query hook

// المكون الرئيسي لتسجيل الدخول
const LoginForm = () => {
  const theme = useTheme();
  const navigate = useNavigate()
  // حالات تخزين بيانات النموذج (البريد الإلكتروني وكلمة المرور فقط)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // حالات التحقق من الأخطاء
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const {
    data: user, 
    isLoading: userLoading,
    refetch, // ✅ استخراج دالة refetch هنا
    isError,
  } = useGetUserByNameQuery(); // Fetch current user

useEffect(() => {
  if (user && !userLoading) {
    navigate("/"); // لو المستخدم مسجل بالفعل، روح للهوم
  }
}, [user, userLoading, navigate]);
  // وظيفة لتحديث بيانات النموذج
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // مسح الخطأ بمجرد أن يبدأ المستخدم في الكتابة
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
    // مسح رسالة النجاح/الفشل عند التعديل
    if (message.text) {
      setMessage({ text: "", type: "" });
    }
  };

  // وظيفة التحقق من صحة الحقول
  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) {
      tempErrors.email = "please enter a valid email address.";
      isValid = false;
    }
    if (!formData.password) {
      tempErrors.password = "password is required.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  // وظيفة لمعالجة إرسال النموذج وإجراء اتصال API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);

      try {
        // استخدام نقطة نهاية تسجيل الدخول (login)
        const response = await fetch(`http://localhost:3000/api/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        });

        // التحقق من حالة الاستجابة
        if (response.ok) {
          const result = await response.json();
          console.log("User logged in successfully:", result);

          setMessage({
            text: `Login successful. Welcome ${
              result.user?.name || formData.email
            }!`,
            type: "success",
          });
          // في التطبيق الحقيقي، هنا يتم حفظ التوكن (Token) وإعادة توجيه المستخدم
          setFormData({ email: "", password: "" });
          navigate("/")
        } else {
          // التعامل مع أخطاء الخادم (مثل بيانات اعتماد غير صحيحة)
          const errorData = await response.json();
          const errorMessage =
            errorData.message || "Login failed. Please try again.";
          console.error("Login failed:", errorMessage);

          setMessage({
            text: errorMessage,
            type: "error",
          });
        }
      } catch (error) {
        console.error("Network or API call error:", error);
        setMessage({
          text: "Network or API call error.",
          type: "error",
        });
      } finally {
        // سواء نجح الإرسال أو فشل، نوقف حالة التحميل
        setIsSubmitting(false);
      }
    } else {
      setMessage({
        text: "please enter valid credentials to sign in.",
        type: "error",
      });
    }
  };

  return (
    // استخدام CssBaseline لتطبيق الأساسيات وتصحيح اختلافات المتصفحات
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 3,
          borderRadius: 2,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 0 20px rgba(255, 255, 255, 0.1)"
              : "0 0 20px rgba(0, 0, 0, 0.1)",
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: theme.palette.primary.main }}>
          <LockOpenOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>

        {/* رسالة النجاح أو الخطأ */}
        {message.text && (
          <Typography
            color={
              message.type === "success"
                ? theme.palette.success.main
                : theme.palette.error.main
            }
            sx={{ mt: 2, fontWeight: "bold" }}
          >
            {message.text}
          </Typography>
        )}

        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid
            container
            spacing={2}
            direction="column"
            justifyContent="center"
          >
            {/* البريد الإلكتروني */}
            <Grid>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                dir="ltr"
              />
            </Grid>
            {/* كلمة المرور */}
            <Grid>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                dir="ltr"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          {/* رابط نسيت كلمة المرور */}
          <Grid container justifyContent="flex-end" sx={{ mt: 1 }}>
            <Grid>
              <Link
                href="#"
                variant="body2"
                sx={{ color: theme.palette.primary.light }}
              >
                you forgot password?
              </Link>
            </Grid>
          </Grid>

          {/* زر تسجيل الدخول */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5, position: "relative" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "تسجيل الدخول"
            )}
          </Button>

          {/* رابط لإنشاء حساب جديد */}
          <Grid container justifyContent="center">
            <Grid>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?
                <Link
                  href="/signup"
                  variant="body2"
                  sx={{ ml: 1, fontWeight: "bold" }}
                >
                  Register
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginForm;
