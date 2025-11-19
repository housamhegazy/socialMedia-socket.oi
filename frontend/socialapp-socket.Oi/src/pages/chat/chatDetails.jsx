// src/components/Chat/ChatDetail.jsx

import React, { useEffect, useState, useRef } from "react";
import { useGetChatDetailsQuery, useGetMessagesQuery } from "../../Api/chatApi/chatApi";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSocket } from "../../Api/notifications/context/SocketContext"; // 💡 استخدام الـ Hook المشترك
import { Typography, Box } from "@mui/material";
import CallComponent from "./CallComponent";

const ChatDetail = () => {
  const { chatId } = useParams(); // جلب الـ ID من URL
  // @ts-ignore
  const { user: currentUser } = useSelector((state) => state.auth);
  const socket = useSocket(); // الحصول على مثيل السوكيت
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null); // للنزول لأسفل القائمة تلقائيًا
  console.log(chatId);
  // 1. جلب الرسائل التاريخية من RTK Query
  const {
    data: historyMessages,
    isLoading,
    isSuccess,
    isFetching,
  } = useGetMessagesQuery(chatId);

  // 2. تحديث الرسائل عند جلب التاريخ لأول مرة أو عند تغيير الـ chatId
  useEffect(() => {
    if (isSuccess && historyMessages) {
      setMessages(historyMessages);
    } else {
      setMessages([]); // مسح الرسائل عند تغيير المحادثة
    }
  }, [isSuccess, historyMessages, chatId]);

  // 3. إدارة أحداث السوكيت (الاستقبال والانضمام)
  useEffect(() => {
    if (!socket || !chatId) return;

    // أ. الانضمام إلى غرفة المحادثة
    // هذا ضروري ليتمكن الباك إند من إرسال الرسائل إلى الغرفة الصحيحة
    socket.emit("join_chat", chatId);

    // ب. الاستماع للرسائل الجديدة
    const handleReceiveMessage = (newMessage) => {
      // إضافة الرسالة الجديدة مباشرة إلى الحالة المحلية
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    socket.on("receive_message", handleReceiveMessage);

    // دالة التنظيف (Cleanup)
    return () => {
      socket.off("receive_message", handleReceiveMessage);
      // socket.emit("leave_chat", chatId); // يمكن إضافتها لتقليل الحمل على السيرفر
    };
  }, [socket, chatId]); // إعادة التنفيذ عند تغيير المحادثة أو اتصال السوكيت

  // 4. النزول لأسفل القائمة تلقائيًا
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 5. دالة إرسال الرسالة
  const sendMessage = (text) => {
    if (!socket || !text || !currentUser) return;

    const messageData = {
      chatId,
      senderId: currentUser._id,
      text,
    };

    // إرسال الرسالة عبر السوكيت (الباقي يتم في الباك إند)
    socket.emit("send_message", messageData);
  };

  const { data: chatDetails } = useGetChatDetailsQuery(chatId);
  // دالة لتحديد ID المستخدم الآخر
const getRecipientId = (chat, currentUserId) => {
    if (!chat || !chat.members) return null;
    const recipient = chat.members.find(member => member._id !== currentUserId);
    return recipient ? recipient._id : null;
};

const recipientId = getRecipientId(chatDetails, currentUser._id);


  if (isLoading || isFetching)
    return <Typography>Loading messages...</Typography>;
  if (!currentUser)
    return <Typography color="error">يرجى تسجيل الدخول.</Typography>;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "flex-end",
      }}
    >
      <Box sx={{ overflowY: "auto", p: 2 }}>
        {recipientId && (
            <CallComponent 
                targetUserId={recipientId} 
            />
        )}
        {messages.map((msg) => (
          <Box
            key={msg._id || Math.random()} // نستخدم الـ ID من DB، أو Math.random() إذا لم يكن متاحًا بعد (لا يفضل)
            sx={{
              textAlign: msg.sender._id === currentUser._id ? "right" : "left",
              mb: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                display: "inline-block",
                p: 1,
                borderRadius: "10px",
                maxWidth: "70%",
                backgroundColor:
                  msg.sender._id === currentUser._id ? "#1976d2" : "#e0e0e0",
                color: msg.sender._id === currentUser._id ? "white" : "black",
              }}
            >
              {msg.text}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ p: 1, borderTop: "1px solid #ccc" }}>
        <input
          type="text"
          placeholder="اكتب رسالتك..."
          style={{ width: "100%", padding: "10px" }}
          onKeyDown={(e) => {
            // @ts-ignore
            if (e.key === "Enter" && e.target.value.trim()) {
              // @ts-ignore
              sendMessage(e.target.value.trim());
              // @ts-ignore
              e.target.value = ""; // مسح حقل الإدخال
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default ChatDetail;
