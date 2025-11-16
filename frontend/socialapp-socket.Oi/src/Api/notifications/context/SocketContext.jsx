// src/Api/notifications/context/SocketContext.js

import { createContext, useContext } from "react";

// تعريف الـ Context لتوفير مثيل الـ Socket.IO
const SocketContext = createContext(null);

// Custom Hook لتسهيل الوصول إلى الـ Socket
export const useSocket = () => useContext(SocketContext);

// تعريف الـ Provider
// الـ Provider نفسه سيكون في ملف آخر (SocketProvider.jsx)
export default SocketContext;