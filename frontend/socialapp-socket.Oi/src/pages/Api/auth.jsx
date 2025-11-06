import { clearAuthUser } from "./Redux/authSlice";

export async function RegisterApi(payload) {
  try {
    const response = await fetch("http://localhost:5000/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // للسماح بإرسال الكوكيز مع الطلب
      body: JSON.stringify(payload),
    });
    return response;
  } catch (error) {
    console.error("Error during registration API call:", error);
    throw error;
  }
}

export async function LoginApi(payload) {
  try {
    const response = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // للسماح بإرسال الكوكيز مع الطلب
      body: JSON.stringify(payload),
    });
    return response;
  } catch (error) {
    console.error("Error during login API call:", error);
    throw error;
  }
}

export async function GetMeApi() {
  try {
    const response = await fetch("http://localhost:5000/api/users/me/profile", {
      credentials: "include", // للسماح بإرسال الكوكيز مع الطلب
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user profile");
    }
    return data;
  } catch (error) {
    console.error("Error during GetMe API call:", error);
    throw error;
  }
}

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
export async function HandleLogout(dispatch,signOut){
    try {
      await signOut().unwrap(); // ✅ ينفّذ الـ POST /api/users/logout
      dispatch(clearAuthUser()); // ✅ يمسح بيانات المستخدم من الستور
      window.location.href = "/login"; // ✅ يرجع المستخدم لصفحة تسجيل الدخول
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };