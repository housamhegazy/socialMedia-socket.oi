
import { createContext, useContext } from "react";

// تعريف الـ Context لتوفير مثيل الـ Socket.IO
export const SocketContext = createContext(null);

// Custom Hook لتسهيل الوصول إلى الـ Socket
export const useSocket = () => useContext(SocketContext);
