// src/components/Chat/ChatList.jsx

import React from "react";
import {
  useDeleteChatMutation,
  useGetUserChatsQuery,
} from "../../Api/chatApi/chatApi";
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
  ListItemAvatar,
  Avatar,
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

  const handleDelete = async (chatId) => {
    const result = await Swal.fire({
      title: "Are you sure ?",
      text: "are you sure you want to delete this chat ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "yes , delete it !",
    });
    if (result.isConfirmed) {
      try {
        await deleteChat(chatId).unwrap();
        Swal.fire("Deleted!", "The chat has been deleted.", "success");
      } catch (err) {
        console.error("Failed to delete the chat: ", err);
        Swal.fire("Error!", "There was an error deleting the chat.", "error");
      }
    }
  };

  return (
<Box sx={{ width: "100%", bgcolor: "background.paper", borderRadius: 2, overflow: "hidden" }}>
  <Typography variant="h6" p={2} sx={{ fontWeight: 600 }}>
    Chats
  </Typography>
  <Divider />

  <List disablePadding>
    {chats.length === 0 ? (
      <Typography p={2}>No chats</Typography>
    ) : (
      chats.map((chat) => {
        const recipient = getRecipient(chat);
        const lastMessageText = chat.lastMessage
          ? chat.lastMessage.text
          : "Start a chat";

        return (
          <ListItem
            key={chat._id}
            secondaryAction={
              <IconButton 
                edge="end" 
                onClick={() => handleDelete(chat._id)} 
                color="error"
                sx={{ "&:hover": { bgcolor: "error.light" } }}
              >
                <Delete />
              </IconButton>
            }
            sx={{
              px: 2,
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <ListItemButton
              component={Link}
              to={`/chatdetails/${chat._id}`}
              sx={{ borderRadius: 1 }}
            >
              {/* الصورة */}
              <ListItemAvatar>
                <Avatar
                  src={recipient?.avatar || ""}
                  alt={recipient?.name}
                  sx={{ width: 48, height: 48 }}
                />
              </ListItemAvatar>

              {/* الاسم + آخر رسالة */}
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {recipient ? recipient.name : "مستخدم محذوف"}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      maxWidth: "200px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {lastMessageText}
                  </Typography>
                }
              />

              {/* الوقت */}
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
              >
                {chat.lastMessage
                  ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </Typography>
            </ListItemButton>
          </ListItem>
        );
      })
    )}
  </List>
</Box>


  );
};

export default ChatList;
