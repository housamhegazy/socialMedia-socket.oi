import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Avatar, IconButton, Box, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { DarkMode, Sunny } from "@mui/icons-material";
const AppBarComponent = ({ handleDrawerToggle,theme,handleTheme }) => {
  //===========================================================================
    const { user: currentUser,isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  return (
    <AppBar
      component={"header"}
      position="sticky"
      sx={{
        minHeight: "64px",
      }}
    >
      <Toolbar>
        {isAuthenticated && <IconButton
          sx={{ color: "white", display: { sm: "none" } }}
          onClick={handleDrawerToggle}
        >
          <MenuIcon fontSize="large" />
        </IconButton> }
        
          <IconButton
                onClick={handleTheme}
                sx={{ mx: "auto", display: "block" }}
                color="inherit"
              >
                {theme.palette.mode === "dark" ? <Sunny /> : <DarkMode />}
              </IconButton>
        <Box
          style={{
            flexGrow: 1,
          }}
        ></Box>
      {
        !isAuthenticated && 
        <>
          <Button
          color="inherit"
          variant="text"
          onClick={() => navigate("/signin")}
        >
          Signin
        </Button>

        <Button
          color="inherit"
          variant="text"
          onClick={() => navigate("/signup")}
        >
          Register
        </Button>

        </>
      }
        
        {
          isAuthenticated && <>
            <Link
          to={`/user/${currentUser?.username}`}
          style={{
            textDecoration: "none",
            color: "inherit",
            marginRight: 10,
          }}
        >
          {currentUser.name}
        </Link>
        <Avatar sx={{ cursor: "pointer" }} alt={"fullName"} src={currentUser?.avatar} />
          </>
        }
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;
