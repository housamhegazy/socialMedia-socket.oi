import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Avatar, IconButton, Box, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
const AppBarComponent = ({ handleDrawerToggle }) => {
  //===========================================================================
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
        <IconButton
          sx={{ color: "white", display: { sm: "none" } }}
          onClick={handleDrawerToggle}
        >
          <MenuIcon fontSize="large" />
        </IconButton>
        <Box
          style={{
            flexGrow: 1,
          }}
        ></Box>

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

        <Link
          to={"/profile"}
          style={{
            textDecoration: "none",
            color: "inherit",
            marginRight: 10,
          }}
        >
          profile
        </Link>
        <Avatar sx={{ cursor: "pointer" }} alt={"fullName"} src={"/"} />
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;
