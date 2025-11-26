import { LockReset, VisibilityOff, Visibility } from "@mui/icons-material";
import { Box, Paper, Typography, Alert, TextField, InputAdornment, IconButton, Button } from "@mui/material";
import { useChangePasswordMutation } from "../../Api/user/userApi";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ResetPassword() {
  // const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {token} = useParams(); // جلب التوكن من URL
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  //==============================================
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [changePassword ] = useChangePasswordMutation()
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      return setError( "write new password");
    }

    if (password !== confirmPassword) {
      return setError("كلمة المرور غير متطابقة");
    }
    console.log({password,token});
    try {
      setLoading(true);
      setError("");
      await changePassword({password,token}).unwrap()

      setSuccess("password changed successfully");
      setTimeout(() => navigate("/signin" , {replace:true}), 2000);

    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء تغيير كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // bgcolor: "#f3f4f6",
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 420,
          borderRadius: 4,
        }}
      >
        <Box textAlign="center" mb={2}>
          <LockReset sx={{ fontSize: 48, color: "primary.main" }} />
          <Typography variant="h5" fontWeight="bold" mt={1}>
            إعادة تعيين كلمة المرور
          </Typography>
        </Box>

        {error && (
          <Alert sx={{ mb: 2 }} severity="error">
            {error}
          </Alert>
        )}

        {success && (
          <Alert sx={{ mb: 2 }} severity="success">
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type={showPass ? "text" : "password"}
            label="كلمة المرور الجديدة"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPass(!showPass)}>
                    {showPass ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            type={showConfirm ? "text" : "password"}
            label="تأكيد كلمة المرور"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mb: 3 }}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ py: 1.3, mt: 1 }}
          >
            {loading ? "جاري التغيير..." : "تغيير كلمة المرور"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
