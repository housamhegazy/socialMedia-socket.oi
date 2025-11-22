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
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // 💡 استيراد useNavigate
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  AccessTime,
  MarkEmailRead,
  MarkEmailUnread,
} from "@mui/icons-material";
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
} from "../../Api/notifications/notificationsApi"; // 💡 تأكد من المسار الصحيح
const Notifications = () => {
  // const { notifications } = useSocket();
  // 🔥 1. جلب قائمة الإشعارات
  const {
    data: notificationsData,
    isLoading,
    isError,
  } = useGetNotificationsQuery();
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

  const handleNotificationClick = (notif) => {
    const postId = notif.post._id
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
    <Box sx={{ width:"100%", margin: "20px auto", p: 2 }}>
      {/* ➡️ العنوان والإجراءات العلوية */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Notifications ({notifications.length})
        </Typography>
        <Button
          startIcon={<MarkEmailRead />}
          onClick={handleMarkAllAsRead}
          variant="outlined"
          size="small"
          color="inherit"
          disabled={!notifications.some((n) => !n.isRead) || isMarking} // تعطيل الزر إذا لم يكن هناك غير مقروء
        >
          mark all as resd
        </Button>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: "12px", overflow: "hidden" }}>
        <List disablePadding>
          {/* ➡️ عرض كل إشعار */}
          {notifications.length === 0 ? (
            <Typography
              sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
            >
              no notifications
            </Typography>
          ) : (
            notifications.map((notif, index) => (
              <Box
                onClick={() => {
                  handleNotificationClick(notif);
                }}
                key={notif._id}
              >
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    py: 2,
                    cursor: "pointer",
                    backgroundColor: !notif.isRead
                      ? theme.palette.action.hover
                      : theme.palette.background.paper,
                    transition: "background-color 0.2s",
                    "&:hover": {
                      backgroundColor: theme.palette.action.selected,
                    },
                  }}
                  onClick={() => {
                    // الانتقال لصفحة البوست ثم وضع علامة مقروء
                    if (!notif.isRead) handleMarkAsRead(notif._id);
                    // navigate(`/post/${notif.postId}`);
                  }}
                >
                  {/* 1. أفاتار المرسل */}
                  <ListItemAvatar>
                    <Avatar
                      src={notif.sender?.avatar}
                      alt={notif.sender?.name}
                    />
                  </ListItemAvatar>

                  {/* 2. محتوى الإشعار */}
                  <ListItemText
                    disableTypography
                    primary={
                      <Box>
                        <Typography
                          component="span"
                          variant="body1"
                          fontWeight={!notif.isRead ? "bold" : "normal"}
                        >
                          <span style={{ color: theme.palette.primary.main }}>
                            {notif.sender?.name}
                          </span>
                          {notif.type === "reply" &&
                            " replied to your comment "}
                          {notif.type === "like" && " liked your post "}
                          {notif.type === "comment" &&
                            ` commented on your post "${
                              notif.post?.text
                                ? notif.post.text.substring(0, 30) + "..."
                                : "..."
                            }" `}
                          {/* يمكن إضافة أنواع إشعارات أخرى هنا */}
                        </Typography>

                        {!notif.isRead && (
                          <Chip
                            label="new"
                            size="small"
                            color="error"
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
                        <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                        <Typography variant="caption">
                          {/* يجب استخدام مكتبة لتنسيق الوقت (مثل date-fns) */}
                          {/* formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ar }) */}
                          {/* {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ar })} */}
                          {formatDistanceToNow(new Date(notif.createdAt), {
                            addSuffix: true,
                            // إذا أردت اللغة العربية، أضف locale: ar
                            locale: ar,
                          })}
                        </Typography>
                      </Box>
                    }
                  />

                  {/* 3. زر الإجراء السريع */}
                  {!notif.isRead && (
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation(); // 💡 منع التنقل عبر الـ Box
                        handleMarkAsRead(notif._id); // وضع علامة مقروء فقط
                      }}
                    >
                      read
                    </Button>
                  )}
                </ListItem>
                {index < notifications.length - 1 && <Divider component="li" />}
              </Box>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default Notifications;
