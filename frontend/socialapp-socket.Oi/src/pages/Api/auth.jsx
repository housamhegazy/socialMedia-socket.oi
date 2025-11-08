import { clearAuthUser } from "./Redux/authSlice";

export async function UserApi(userId) {
  try {
    const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
      credentials: "include", // للسماح بإرسال الكوكيز مع الطلب
    });
    const data = response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user data");
    }
    return data;
  } catch (error) {
    console.error("Error during User API call:", error);
    throw error;
  }
}

//logout
export async function HandleLogout(dispatch, signOut, navigate) {
  try {
    await signOut().unwrap(); // ✅ ينفّذ الـ POST /api/users/logout
    window.location.replace("/signin"); // ✅ بدل navigate
    setTimeout(() => {
      dispatch(clearAuthUser());
    }, 300); // ✅ يمسح بيانات المستخدم من الستور
    
  } catch (err) {
    console.error("Logout failed:", err);
  }
}
