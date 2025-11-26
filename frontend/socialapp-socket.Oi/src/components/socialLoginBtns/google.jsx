// زر الدخول عن طريق جوجل 
import { Google } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
// @ts-ignore
const allowedBaseUrls = import.meta.env.VITE_API_URL;
const GoogleLogin = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${allowedBaseUrls}/auth/google`; // يوجه إلى نهاية الباك اند
  };
  return (
     <Box sx={{ my: 2 }}>
      <Button
        variant="contained"
        onClick={handleGoogleLogin}
        startIcon={<Google />}
        sx={{
          backgroundColor: '#4285F4',
          width:"150px",
          color: 'white',
          borderColor: '#ccc',
          '&:hover': {
             borderColor: '#999',
            // backgroundColor: '#fafafaff',
            color:"black"
          },
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 'bold',
          padding: '10px 10px',
          borderRadius: '5px',
          boxShadow: '0 2px 4px 0 rgba(0,0,0,.15)',
        }}
      >
        <Typography component="span" sx={{ ml: 1 }}>
          Google
        </Typography>
      </Button>
    </Box>
  );
};

export default GoogleLogin;