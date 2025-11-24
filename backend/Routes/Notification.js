const express = require("express");
const router = express.Router();
const NotificationSchema = require("../Models/notifications.js");
const { AuthMiddleware } = require("../Middleware/AuthMiddleware.js");

router.get("/", AuthMiddleware, async (req, res) => {
  try {
    const notification = await NotificationSchema.find({
      recipient: req.user.id,
    })
      .populate("sender", "name avatar")
      .populate("post", "text owner")
      .populate("comment","text")
      .sort({ createdAt: -1 });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/unread-count", AuthMiddleware, async (req, res) => {
  try {
    const count = await NotificationSchema.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc    وضع علامة كمقروء لإشعار واحد أو جميع الإشعارات
 * @route   PATCH /api/notifications/mark-read/:notificationId
 * @route   PATCH /api/notifications/mark-read/all
 * @access  Private
 */
router.patch("/mark-read/:notificationId", AuthMiddleware, async (req, res) => {
  // مُعرِّف الإشعار (إذا كان موجوداً) أو الكلمة 'all'
  const { notificationId } = req.params;
  const userId = req.user.id;

  try {
    let updateResult;

    if (notificationId === "all") {
      // 🚨 وضع علامة كمقروء لجميع الإشعارات الخاصة بهذا المستخدم
      updateResult = await NotificationSchema.updateMany(
        { recipient: userId, isRead: false }, // الشرط: إشعارات غير مقروءة خاصة بالمستخدم
        { $set: { isRead: true, readAt: new Date() } } // التحديث: وضع علامة كمقروء
      );

      // قد ترغب في إرسال إشعار للمستخدم بأن العداد تم تحديثه

      res.status(200).json({
        success: true,
        message: `${updateResult.modifiedCount} notifications marked as read.`,
        markAll: true,
      });
    } else {
      // 🎯 وضع علامة كمقروء لإشعار واحد محدد
      const notification = await NotificationSchema.findOneAndUpdate(
        { _id: notificationId, recipient: userId, isRead: false },
        { $set: { isRead: true, readAt: new Date() } },
        { new: true } // لإرجاع المستند بعد التحديث
      );

      if (!notification) {
        // قد يكون الإشعار مقروءاً بالفعل أو غير موجود أو ليس للمستخدم
        return res
          .status(244)
          .json({
            success: true,
            message: "Notification already read or not found",
          });
      }

      res.status(200).json({
        success: true,
        message: "Notification marked as read.",
        notificationId: notification._id,
        notification: notification, // إرجاع الإشعار المحدث قد يكون مفيداً
      });
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during update." });
  }
});
//===================== حذف إشعار ========================================
router.delete("/delete/:notificationId", AuthMiddleware, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    const deletedNotification = await NotificationSchema.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });

    if (!deletedNotification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or not authorized to delete.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
      notificationId: deletedNotification._id,
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: "Server error during deletion." });
  }
}); 
module.exports = router;
