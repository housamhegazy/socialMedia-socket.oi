import { Box, CircularProgress, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const LoadingPage = ({ text = "Loading..." }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100%",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        transition: "all 0.3s ease",
      }}
    >
      <CircularProgress
        size={60}
        thickness={4}
        sx={{
          color:
            theme.palette.mode === "dark"
              ? theme.palette.primary.light
              : theme.palette.primary.main,
          mb: 3,
        }}
      />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 500,
          letterSpacing: 0.5,
          opacity: 0.8,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

export default LoadingPage;
