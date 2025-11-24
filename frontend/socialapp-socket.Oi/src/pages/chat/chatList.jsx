// src/components/Chat/ChatList.jsx

import React from "react";
import { useDeleteChatMutation, useGetUserChatsQuery } from "../../Api/chatApi/chatApi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import Swal from "sweetalert2";

const ChatList = () => {
  // جلب قائمة المحادثات من RTK Query
  const { data: chats, isLoading, isError } = useGetUserChatsQuery();
  // @ts-ignore
  const { user: currentUser } = useSelector((state) => state.auth);
  const [deleteChat] = useDeleteChatMutation();
  if (isLoading) return <Typography>Loading Chats...</Typography>;
  if (isError)
    return <Typography color="error">Error loading chats.</Typography>;

  // دالة مساعدة للعثور على الطرف الآخر في المحادثة الثنائية
  const getRecipient = (chat) => {
    return chat.members.find((m) => m._id !== currentUser._id);
  };

  const handleDelete= async(chatId)=>{
    const result =  await Swal.fire({
      title: "Are you sure ?",
      text: "are you sure you want to delete this chat ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'yes , delete it !'

    });
    if(result.isConfirmed){
        try{
      await deleteChat(chatId).unwrap();
    }catch(err){
      console.error("Failed to delete the chat: ", err);
    }
    }
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
      <Typography variant="h6" p={2}>
        chat
      </Typography>
      <Divider />
      <List>
        {chats.length === 0 ? (
          <Typography p={2}> no chats </Typography>
        ) : (
          chats.map((chat) => {
            const recipient = getRecipient(chat);
            const lastMessageText = chat.lastMessage
              ? chat.lastMessage.text
              : "Start a chat";

            return (
              <>
              <Box
                key={chat._id}
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {/* ربط الـ Chat ID بمسار الصفحة المفصلة */}
                <ListItemButton
                  sx={{ color: "text.primary" }}
                  component={Link}
                  to={`/chatdetails/${chat._id}`}
                >
                  <ListItemText
                    primary={recipient ? recipient.name : "مستخدم محذوف"}
                    secondary={
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        noWrap // لمنع تجاوز النص
                      >
                        {lastMessageText}
                      </Typography>
                    }
                  />
                  {/* يمكنك إضافة وقت آخر رسالة هنا */}
                  <Typography variant="body1" color="inherit">
                    {chat.lastMessage
                      ? new Date(
                          chat.lastMessage.createdAt
                        ).toLocaleTimeString()
                      : ""}
                  </Typography>
                </ListItemButton>
                {/* delete button */}
                
                  <IconButton onClick={()=>{
                    handleDelete(chat._id)
                  }} color="error">
                    <Delete />
                </IconButton>
                
              </Box>
              <Divider variant="inset" component="li" />
              </>
              
            );
            
          })
        )}
      </List>
    </Box>
  );
};

export default ChatList;
