const express = require("express");
const router = express.Router();
const { AuthMiddleware } = require("../Middleware/AuthMiddleware.js");

const {
  register,
  login,
  resetPassword,
  changePassword,
  getMyProfile,
  logout,
  searchUsers,
  updateAvatar,
  getUserByUsername,
  deleteMyAccount,
  updateCover
} = require("../comntrollers/User.js");
const {
  upload,
} = require("../Utils/cloudinary.js");

router.post("/register", register);

router.post("/login", login);

//reset password request
router.post("/forget-password", resetPassword);
//change password
router.put("/reset-password", changePassword);
// get my profile (used in redux to get user data)
router.get("/me/profile", AuthMiddleware, getMyProfile);

router.post("/logout", AuthMiddleware, logout);

//==================================== search for users =============================================
router.get("/search", AuthMiddleware, searchUsers);
//========================================== edit profile photo ==========================================
router.put("/edit", AuthMiddleware, upload.single("avatar"), updateAvatar);
//========================================== edit profile photo ==========================================
router.put("/editCover", AuthMiddleware, upload.single("cover"), updateCover);

//==================================== get user by username =============================================
router.get("/:username", AuthMiddleware, getUserByUsername);

//==================================== delete my account =============================================
router.delete("/deleteAccount", AuthMiddleware, deleteMyAccount);
module.exports = router;
