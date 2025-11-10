// src/theme/theme.js
import { createTheme } from "@mui/material/styles";
import getDesignTokens from "./getDesignTokens";

export const generateTheme = (mode) => createTheme(getDesignTokens(mode));
