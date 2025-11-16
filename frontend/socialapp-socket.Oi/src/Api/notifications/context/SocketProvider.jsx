// src/Api/notifications/context/SocketProvider.jsx

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
// 💡 استيراد تعريف الـ Context والـ RTK Query
import SocketContext, { useSocket } from "./SocketContext"; 
import { notificationApi } from "../notificationsApi";

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // ⚠️ يتم إنشاء الاتصال فقط إذا كان المستخدم مسجلاً الدخول
    if (isAuthenticated && user?._id) {
      // 1. إنشاء الاتصال (تأكد من العنوان والمنفذ)
      const newSocket = io("http://localhost:3000", { // لا تستخدم /notifications هنا، اجعلها على root path
        withCredentials: true,
      });
      setSocket(newSocket);

      // 2. إرسال حدث الانضمام (Join) عند الاتصال
      newSocket.on("connect", () => {
        newSocket.emit("join", user._id);
        console.log(`Socket connected for user: ${user._id}`);
      });
      
      // 3. الاستماع للإشعارات الجديدة القادمة من السيرفر
      newSocket.on("receiveNotification", (notification) => {
        console.log("New Notification received via Socket:", notification);

        // 🔥 تحديث RTK Query Cache tags
        // هذا سيجبر: 
        // أ) useGetNotificationsQuery على إعادة الجلب لقائمة الإشعارات.
        // ب) useGetUnreadCountQuery على إعادة الجلب لعداد الإشعارات.
        dispatch(
          notificationApi.util.invalidateTags(["Notification", "UnreadCount"])
        );
      });

      // 4. دالة التنظيف (Cleanup) عند إزالة المكون أو تسجيل الخروج
      return () => {
        newSocket.off("receiveNotification");
        newSocket.close();
      };
    } else {
        // إذا قام المستخدم بتسجيل الخروج، نظف الـ Socket
        if(socket) {
            socket.close();
            setSocket(null);
        }
    }
  }, [isAuthenticated, user, dispatch]); 
  
  // 💡 لم نعد نمرر notifications و unreadCount، بل نمرر الـ socket فقط
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};