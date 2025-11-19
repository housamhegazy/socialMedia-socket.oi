// src/components/Chat/ChatList.jsx

import React from 'react';
import { useGetUserChatsQuery } from '../../Api/chatApi/chatApi';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Box, List, ListItem, ListItemButton, ListItemText, Typography, Divider } from '@mui/material';

const ChatList = () => {
    // جلب قائمة المحادثات من RTK Query
    const { data: chats, isLoading, isError } = useGetUserChatsQuery();
    // @ts-ignore
    const { user: currentUser } = useSelector((state) => state.auth);

    if (isLoading) return <Typography>Loading Chats...</Typography>;
    if (isError) return <Typography color="error">Error loading chats.</Typography>;

    // دالة مساعدة للعثور على الطرف الآخر في المحادثة الثنائية
    const getRecipient = (chat) => {
        return chat.members.find(m => m._id !== currentUser._id);
    };

    return (
        <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
            <Typography variant="h6" p={2}>محادثاتي</Typography>
            <Divider />
            <List>
                {chats.length === 0 ? (
                    <Typography p={2}>لا توجد محادثات بعد.</Typography>
                ) : (
                    chats.map((chat) => {
                        const recipient = getRecipient(chat);
                        const lastMessageText = chat.lastMessage ? chat.lastMessage.text : 'بدء محادثة';

                        return (
                            <div key={chat._id}>
                                {/* ربط الـ Chat ID بمسار الصفحة المفصلة */}
                                <ListItemButton sx={{color:'text.primary'}} component={Link} to={`/chatdetails/${chat._id}`}>
                                    <ListItemText 
                                        primary={recipient ? recipient.username : 'مستخدم محذوف'}
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
                                </ListItemButton>
                                <Divider variant="inset" component="li" />
                            </div>
                        );
                    })
                )}
            </List>
        </Box>
    );
};

export default ChatList;