import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import { useSendEmailLinkMutation } from "../../Api/user/userApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sendEmail] = useSendEmailLinkMutation();
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setLoading(true);

    try {
      await sendEmail({email}).unwrap();
      setSuccess("reset password link sent to your email successfully")
    } catch (err) {
      console.log(err);
      setError(err.data.message)
      
    }finally{
      setLoading(false);
    }

    
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        // bgcolor: "#f4f4f4",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: "420px",
          p: 4,
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" mb={1} fontWeight="bold">
          Forgot Password
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Enter your email and we will send you a password reset link.
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleForgotPassword}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
