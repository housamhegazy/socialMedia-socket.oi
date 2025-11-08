import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import LoadingPage from '../../components/loadingPage';

// المكون الرئيسي لتسجيل الدخول
const SignUpForm = () => {
  const theme = useTheme();
  const navigate = useNavigate()
    const { user, isAuthenticated,isLoadingAuth } = useSelector((state) => state.auth);
  // حالات تخزين بيانات النموذج
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // حالات التحقق من الأخطاء
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
useEffect(() => {
  if (user && !isLoadingAuth) {
    navigate("/"); // لو المستخدم مسجل بالفعل، روح للهوم
  }
}, [user, isLoadingAuth, navigate]);
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
        [name]: '',
      });
    }
    // مسح رسالة النجاح/الفشل عند التعديل
    if (message.text) {
        setMessage({ text: '', type: '' });
    }
  };

  // وظيفة التحقق من صحة الحقول
  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      tempErrors.name = 'First name is required.';
      isValid = false;
    }
    if (!formData.email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) {
      tempErrors.email = 'Invalid email address.';
      isValid = false;
    }
    if (formData.password.length < 6) {
      tempErrors.password = 'password must be at least 6 characters long.';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  // signup form submission handler
  const handleSubmit = async(e) => {
    e.preventDefault();
    if (validate()) {
      // هنا تضع منطق إرسال البيانات إلى الخادم (مثل API call)
      setIsSubmitting(true);
      try{
        const response = await fetch(`http://localhost:3000/api/users/register`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(formData)
        })
         // التحقق من حالة الاستجابة
        if(response.ok){
          const result = await response.json();
          console.log('User registered successfully:', result);

          setMessage({ 
              text: `Registration successful for email: ${formData.email}`, 
              type: 'success' 
          });
          // مسح النموذج بعد التسجيل الناجح
          setFormData({ name: '', email: '', password: '' });
          navigate("/")
        } else {
          // التعامل مع أخطاء الخادم (مثل بريد إلكتروني موجود مسبقًا)
          const errorData = await response.json();
          const errorMessage = errorData.message || 'Registration failed. Please try again.';
          console.error('Registration failed:', errorMessage);

          setMessage({ 
            text: errorMessage, 
            type: 'error' 
          });
        }
      }catch(error){
         console.error('Network or API call error:', error);
        setMessage({ 
          text: 'Network or API call error.', 
          type: 'error' 
        });
      }finally {
        // سواء نجح الإرسال أو فشل، نوقف حالة التحميل
        setIsSubmitting(false);
      }

    } else {
      setMessage({ 
        text: 'please fix the errors above.', 
        type: 'error' 
      });
    }
  };

if(!user){
  return (
    // استخدام CssBaseline لتطبيق الأساسيات وتصحيح اختلافات المتصفحات
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 3,
          borderRadius: 2,
          boxShadow: theme.palette.mode === 'dark' ? '0 0 20px rgba(255, 255, 255, 0.1)' : '0 0 20px rgba(0, 0, 0, 0.1)',
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: theme.palette.secondary.main }}>
          <LockOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          Create an Account
        </Typography>

        {/* رسالة النجاح أو الخطأ */}
        {message.text && (
            <Typography 
                color={message.type === 'success' ? theme.palette.success.main : theme.palette.error.main} 
                sx={{ mt: 2, fontWeight: 'bold' }}
            >
                {message.text}
            </Typography>
        )}

        <Box component="form" noValidate onSubmit={handleSubmit}  sx={{ mt: 3 }}>
          <Grid container spacing={2} sx={{flexDirection: "column",justifyContent:"center"}}>
            {/* الاسم الأول */}
            <Grid >
              <TextField
                name="name"
                required
                fullWidth
                label="Name"
                autoFocus
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                dir="rtl"
              />
            </Grid>
            {/* البريد الإلكتروني */}
            <Grid >
              <TextField
                required
                fullWidth
                label=" Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                dir="ltr" // البريد الإلكتروني يفضل أن يكون باتجاه اليسار
              />
            </Grid>
            {/* كلمة المرور */}
            <Grid >
              <TextField
                required
                fullWidth
                name="password"
                label="كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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
          
          {/* زر التسجيل */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5, position: 'relative' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'تسجيل'}
          </Button>

          {/* رابط لتسجيل الدخول */}
          <Grid container justifyContent="flex-end">
            <Grid >
              <Link href="/login" variant="body2" sx={{ color: theme.palette.getContrastText(theme.palette.background.paper) }}>
                 you already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
};


export default SignUpForm;
