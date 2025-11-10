// src/theme/theme.js
import { createTheme } from "@mui/material/styles";

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          housam: { main: "#64748B" },
          faveColor: { main: "rgb(247,247,247)" },
          primary: { main: "#01579b" },
          background: { default: "#ffffff", paper: "#ffffff" },
        }
      : {
          housam: { main: "#008080" },
          faveColor: { main: "#008080" },
          primary: { main: "#1e1e1e" },
          background: { default: "#1e1e1e", paper: "#2d2d30" },
        }),
  },
});

export const generateTheme = (mode) => createTheme(getDesignTokens(mode));
export default getDesignTokens;
