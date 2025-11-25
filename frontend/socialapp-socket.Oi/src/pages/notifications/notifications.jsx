import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  Paper,
  Chip, // للمقروء/غير المقروء
  useTheme,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // 💡 استيراد useNavigate
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  AccessTime,
  Delete,
  MarkEmailRead,
  MarkEmailUnread,
} from "@mui/icons-material";
import {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
} from "../../Api/notifications/notificationsApi"; // 💡 تأكد من المسار الصحيح
import { useState } from "react";
const Notifications = () => {
  // const { notifications } = useSocket();
  // 🔥 1. جلب قائمة الإشعارات
  const [deletingId, setDeletingId] = useState(null);
  const {
    data: notificationsData,
    isLoading,
    isError,
  } = useGetNotificationsQuery();
  const [deleteNotification] = useDeleteNotificationMutation();
  const notifications = notificationsData || [];
  const theme = useTheme();
  const navigate = useNavigate(); // 💡 تهيئة Hook التنقل
  // 🔥 2. تهيئة Mutation لوضع علامة القراءة
  const [markRead, { isLoading: isMarking }] =
    useMarkNotificationAsReadMutation();

  // دالة لوضع علامة على إشعار واحد كمقروء
  const handleMarkAsRead = (notificationId) => {
    markRead({ notificationId });
  };

  // دالة لوضع علامة على كل الإشعارات كمقروءة
  const handleMarkAllAsRead = () => {
    markRead({ markAll: true });
  };

  // دالة لحذف إشعار
  const handleDelete = async (notificationId) => {
    setDeletingId(notificationId); // ضع معرف الإشعار الذي يتم حذفه
    try {
      await deleteNotification(notificationId).unwrap();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    } finally {
      setDeletingId(null); // قم بمسح المعرف بعد الانتهاء
    }
  };

  const handleNotificationClick = (notif) => {
    const postId = notif.post._id;
    // 1. ضع علامة كمقروء (إذا لم تكن مقروءة بالفعل)
    if (!notif.isRead) {
      handleMarkAsRead(notif._id);
    }

    // 2. تحديد مسار التنقل
    let targetPath = `/posts/${postId}`;

    // إذا كان إشعاراً عن تعليق أو رد، يجب أن نذهب إلى المنشور نفسه
    // أو يمكنك إضافة Query Parameter لتحديد التعليق:
    if (notif.type === "comment" || notif.type === "reply") {
      // المسار سيصبح: /posts/:postId?highlightComment=:commentId
      targetPath = `/posts/${postId}?comment=${notif.comment?._id}`;
    }

    // 3. التنقل
    navigate(targetPath);
  };

  // ------------------
  // 🚨 حالات التحميل والخطأ
  // ------------------

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>جاري تحميل الإشعارات...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 5, textAlign: "center", color: "error.main" }}>
        <Typography variant="h6">حدث خطأ أثناء جلب الإشعارات.</Typography>
        <Typography>الرجاء المحاولة مرة أخرى.</Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ width: "100%", maxWidth: 700, margin: "20px auto", p: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography fontSize="16px" fontWeight="bold">
          Notifications ({notifications.length})
        </Typography>

        <Button
          startIcon={<MarkEmailRead sx={{ fontSize: 18 }} />}
          onClick={handleMarkAllAsRead}
          variant="outlined"
          size="small"
          sx={{
            fontSize: "12px",
            textTransform: "none",
            borderRadius: "10px",
            px: 1.5,
          }}
          color="inherit"
          disabled={!notifications.some((n) => !n.isRead) || isMarking}
        >
          Mark all as read
        </Button>
      </Box>

      <Paper
        elevation={2}
        sx={{
          borderRadius: "14px",
          overflow: "hidden",
          backgroundColor: "background.paper",
        }}
      >
        <List disablePadding>
          {notifications.length === 0 ? (
            <Typography
              sx={{
                p: 4,
                textAlign: "center",
                color: "text.secondary",
                fontSize: "14px",
              }}
            >
              No notifications
            </Typography>
          ) : (
            notifications.map((notif) => {
              const isUnread = !notif.isRead;

              return (
                <Box
                  key={notif._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: isUnread
                      ? theme.palette.action.hover
                      : theme.palette.background.paper,
                    transition: "0.2s",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:hover": {
                      backgroundColor: theme.palette.action.selected,
                    },
                  }}
                >
                  {/* Left clickable area */}
                  <ListItem
                    onClick={() => {
                      if (isUnread) handleMarkAsRead(notif._id);
                      handleNotificationClick(notif);
                    }}
                    sx={{
                      py: 2,
                      pr: 1,
                      cursor: "pointer",
                      width: "100%",
                    }}
                    alignItems="flex-start"
                  >
                    {/* Avatar */}
                    <ListItemAvatar>
                      <Avatar
                        src={notif.sender?.avatar}
                        alt={notif.sender?.name}
                        sx={{ width: 42, height: 42 }}
                      />
                    </ListItemAvatar>

                    {/* Text */}
                    <ListItemText
                      disableTypography
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            variant="body1"
                            color="text.primary"
                            fontWeight={isUnread ? "bold" : "normal"}
                          >
                            <span
                              style={{ color: theme.palette.text.secondary }}
                            >
                              {notif.sender?.name}
                            </span>{" "}
                            {notif.type === "reply" &&
                              "replied to your comment"}
                            {notif.type === "like" && "liked your post"}
                            {notif.type === "comment" &&
                              `commented on your post "${
                                notif.post?.text
                                  ? notif.post.text.substring(0, 30) + "..."
                                  : ""
                              }"`}
                          </Typography>

                          {isUnread && (
                            <Chip
                              label="new"
                              color="error"
                              size="small"
                              sx={{ ml: 1, height: 20 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mt: 0.5,
                            color: "text.secondary",
                          }}
                        >
                          <AccessTime sx={{ fontSize: 15, mr: 0.5 }} />
                          <Typography variant="caption">
                            {formatDistanceToNow(new Date(notif.createdAt), {
                              addSuffix: true,
                              locale: ar,
                            })}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>

                  {/* Action buttons (delete / mark read) */}
                  <Box sx={{ pr: 1, display: "flex", gap: 0.5 }}>
                    {!notif.isRead && (
                      <Button
                        size="small"
                        color="inherit"
                        sx={{ fontSize: "11px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notif._id);
                        }}
                      >
                        Read
                      </Button>
                    )}

                    <IconButton
                      onClick={() => handleDelete(notif._id)}
                      color="error"
                      size="small"
                      disabled={deletingId === notif._id}
                    >
                      {deletingId === notif._id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Delete sx={{ fontSize: 20 }} />
                      )}
                    </IconButton>
                  </Box>
                </Box>
              );
            })
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default Notifications;
