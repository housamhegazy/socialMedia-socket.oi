// src/components/Chat/ChatDetail.jsx

import React, { useEffect, useState, useRef } from "react";
import {
  useGetChatDetailsQuery,
  useGetMessagesQuery,
} from "../../Api/chatApi/chatApi";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSocket } from "../../Api/notifications/context/SocketContext"; // 💡 استخدام الـ Hook المشترك
import { Typography, Box, useTheme } from "@mui/material";

const ChatDetail = () => {
  const theme = useTheme();
  const { chatId } = useParams(); // جلب الـ ID من URL
  // @ts-ignore
  const { user: currentUser } = useSelector((state) => state.auth);
  const socket = useSocket(); // الحصول على مثيل السوكيت
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null); // للنزول لأسفل القائمة تلقائيًا
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
  const currentUserId = currentUser?._id;

  // دالة لتحديد ID المستخدم الآخر
  const getRecipient = (chatDetails) => {
    if (!chatDetails || !chatDetails.members) return null;
    const recipient = chatDetails?.members?.find(
      (member) => String(member._id) !== String(currentUserId)
    );
    return recipient ? recipient : null;
  };
  const recipient = getRecipient(chatDetails);
  const recipientId = recipient?._id;
  console.log("members:", chatDetails?.members);
  console.log("currentUserId:", currentUserId);
  console.log("recipient:", recipient);
  if (isLoading || isFetching)
    return <Typography>Loading messages...</Typography>;
  if (!currentUser)
    return <Typography color="error">يرجى تسجيل الدخول.</Typography>;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh", // افترض أن شريط التنقل العلوي بارتفاع 64 بكسل
        bgcolor: theme.palette.background.paper,
      }}
    >
      {/* 👇 الجزء العلوي الثابت (CallComponent) */}
      {recipientId && (
        <Box
          sx={{
            p: 1.5,
            borderBottom: "1px solid #ccc",
            backgroundColor: theme.palette.background.paper,
            position: "sticky",
            top: 64,
            zIndex: 10,
          }}
        >
          {/* يمكن وضع مكون الاتصال هنا */}
          <Box
            sx={{
              p: 1.5,
              position: "sticky",
              top: 64,
              bgColor: theme.palette.background.paper,
              display: "flex",
              alignItems: "center",
              gap: 1,
              zIndex: 10,
            }}
          >
            <img
              src={recipient.avatar}
              alt={recipient?.name}
              style={{ width: 40, height: 40, borderRadius: "50%" }}
            />
            <Typography sx={{ fontSize: "1.1rem", fontWeight: "bold" }}>
              {recipient.name}
            </Typography>
          </Box>
        </Box>
      )}

      {/* 👇 صندوق الرسائل (Scrollable) */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {messages.map((msg) => (
          <Box
            key={msg._id || Math.random()}
            sx={{
              display: "flex",
              justifyContent:
                msg.sender._id === currentUser._id ? "flex-end" : "flex-start",
            }}
          >
            <Typography
              sx={{
                p: 1.2,
                borderRadius: "18px",
                maxWidth: "70%",
                fontSize: "0.95rem",
                bgcolor:
                  msg.sender._id === currentUser._id ? "#1877f2" : "#e4e6eb",
                color: msg.sender._id === currentUser._id ? "white" : "black",
              }}
            >
              {msg.text}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef}></div>
      </Box>

      {/* 👇 صندوق الكتابة ثابت تحت */}
      <Box
        sx={{
          p: 1.5,
          borderTop: "1px solid #ccc",
          bgcolor: theme.palette.background.paper,
          display: "flex",
          alignItems: "center",
          gap: 1,
          position: "sticky",
          bottom: 0,
          zIndex: 10,
        }}
      >
        <input
          type="text"
          placeholder="Write a message..."
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            outline: "none",
            fontSize: "1rem",
          }}
          onKeyDown={(e) => {
            const input = e.currentTarget;
            if (e.key === "Enter" && input.value.trim()) {
              sendMessage(input.value.trim());
              input.value = "";
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default ChatDetail;
