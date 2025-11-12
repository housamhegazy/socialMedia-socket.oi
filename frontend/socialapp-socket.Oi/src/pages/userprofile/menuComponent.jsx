import * as React from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
} from "@mui/material";
import { MoreVert, DeleteForever, PersonAdd } from "@mui/icons-material";

export default function ProfileMenu({ onDelete, isMyProfile,BtnName }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    handleClose();
    if (onDelete) onDelete();
  };
  return (
    <>
      <IconButton
        aria-label="settings"
        onClick={handleClick}
        sx={{
          color: "text.secondary",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
        }}
      >
        <MoreVert />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableScrollLock={true}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 180,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        }}
      >
        {isMyProfile ? (
          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            <ListItemIcon>
              <DeleteForever fontSize="small" color="error" />
            </ListItemIcon>
            <Typography variant="body2">{BtnName}</Typography>
          </MenuItem>
        ) : (
          <MenuItem sx={{ color: "text.main" }}>
            <ListItemIcon>
              <PersonAdd fontSize="small" color="inherit" />
            </ListItemIcon>
            <Typography variant="body2">follow</Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
