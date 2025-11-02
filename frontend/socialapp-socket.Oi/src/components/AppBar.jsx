import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import {
  Avatar,
  IconButton,
  Box,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
const AppBarComponent = ({ handleDrawerToggle, drawerWidth, sidebarWidth }) => {
  //===========================================================================
  const navigate = useNavigate();
  return (
      <AppBar component={"header"} position="static" sx={{minHeight:"64px"}} >
        <Toolbar sx={{ marginLeft: { sm: `${drawerWidth}px` }, marginRight: { md: `${sidebarWidth}px` }  }}>
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
            onClick={() => navigate("/register")}
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
