const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const FriendRequest = require("../Models/FriendRequest"); // تم تغيير friendRequestSchema إلى FriendRequest
const User = require("../Models/User");
const { AuthMiddleware } = require("../Middleware/AuthMiddleware");

// ملاحظة: هذا الملف يفترض أن كائن Socket.IO (io) تم تخزينه في Express عبر app.set('io', io) في ملف server.js

// --- 1. إرسال طلب صداقة (POST /api/friends/request) ---
router.post("/request", AuthMiddleware, async (req, res) => {
  const senderId = req.user.id;
  const { receiverId } = req.body;

  // 1. التحقق من النفس والوجود
  if (senderId === receiverId) {
    return res.status(400).json({ message: "لا يمكنك إرسال طلب صداقة لنفسك." });
  }
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return res.status(404).json({ message: "المستخدم المُستَقبِل غير موجود." });
  }

  // 2. التحقق من وجود طلب سابق أو صداقة
  const alreadyFriends = receiver.friends.includes(senderId);
  if (alreadyFriends) {
    return res.status(400).json({ message: "أنتم بالفعل أصدقاء." });
  }

  const existingRequest = await FriendRequest.findOne({
    $or: [
      { sender: senderId, receiver: receiverId, status: "Pending" },
      { sender: receiverId, receiver: senderId, status: "Pending" }, // منع طلب عكسي معلّق
    ],
  });
  if (existingRequest) {
    return res.status(400).json({ message: "يوجد طلب صداقة معلّق بالفعل." });
  }

  try {
    // 3. إنشاء الطلب
    const newRequest = new FriendRequest({
      sender: senderId,
      receiver: receiverId,
    });
    await newRequest.save();

    // 4. إرسال تنبيه عبر السوكيت
    // يجب أن تكون دالة app.get('io') متاحة فقط إذا تم إعداد Socket.IO بشكل صحيح في ملف server.js
    const io = req.app.get("io");
    if (io) {
      // إرسال تنبيه للمستخدم المُستَقبِل
      io.to(receiverId).emit("friend_request_received", {
        senderId: senderId,
        message: `لديك طلب صداقة جديد من ${req.user.username}`, // إضافة رسالة مساعدة
      });
    }

    res.status(201).json({ message: "تم إرسال طلب الصداقة بنجاح." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في إرسال الطلب.", error: error.message });
  }
});

//===================================== جلب حالة طلب الصداقه ==============================================
router.get(`/status/:otherUserId`, AuthMiddleware, async (req, res) => {
  // ID المستخدم الذي يتم عرض صفحته (Receiver/Other User)
  const otherUserId = req.params.otherUserId;
  // ID المستخدم الحالي المسجل دخول (Sender/Current User)
  // نفترض أن ID المستخدم متاح عبر middleware التوثيق (req.user.id)
  const currentUserId = req.user.id;

  // لا يمكن التحقق من حالة الصداقة مع النفس
  if (currentUserId === otherUserId) {
    return res.json({ status: "Self" });
  }

  // 1. التحقق من الصداقة أولاً
  try {
    const currentUser = await User.findById(currentUserId).select("friends");
    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found." });
    }

    // تحويل IDs الأصدقاء إلى String للمقارنة
    const isFriend = currentUser.friends.some(
      (friendId) => friendId.toString() === otherUserId
    );

    if (isFriend) {
      // إذا كانا صديقين بالفعل
      return res.json({ status: "Friends" });
    }

    // 2. إذا لم يكونا صديقين، تحقق من طلبات الصداقة المعلقة
    const pendingRequest = await FriendRequest.findOne({
      status: "Pending",
      $or: [
        // الحالة الأولى: طلب مرسل من المستخدم الحالي إلى المستخدم الآخر
        { sender: currentUserId, receiver: otherUserId },
        // الحالة الثانية: طلب مرسل من المستخدم الآخر إلى المستخدم الحالي
        { sender: otherUserId, receiver: currentUserId },
      ],
    });

    if (pendingRequest) {
      // =========================================================================
      // 💡 تحديد "direction" (الاتجاه) ديناميكياً
      // هذا الحقل (direction) لا يُخزّن في قاعدة البيانات، بل يُحسب ويرسل في الرد.
      // =========================================================================
      const direction =
        pendingRequest.sender.toString() === currentUserId
          ? "Sent" // إذا كان المُرسِل هو المستخدم الحالي (الطلب مرسل منك)
          : "Received"; // إذا كان المُرسِل هو المستخدم الآخر (الطلب مرسل إليك)

      return res.json({
        status: "Pending",
        direction: direction,
        // إذا كان الاتجاه 'Received' (أي طلب إليك)، نرسل ID الطلب لسهولة القبول/الرفض لاحقاً
        ...(direction === "Received" && { requestId: pendingRequest._id }),
      });
    }

    // 3. إذا لم يكن هناك أي علاقة
    return res.json({ status: "None" });
  } catch (error) {
    console.error("Error fetching friendship status:", error);
    res.status(500).json({ message: "Server error while fetching status." });
  }
});

//======================================================= cancel friend requist ===============================================
router.delete("/cancel/:receiverId",AuthMiddleware,async (req, res) => {
    // ID مستقبل الطلب (الشخص الذي أرسلنا إليه الطلب)
    const receiverId = req.params.receiverId;
    // ID المستخدم الحالي (يجب أن يكون هو المُرسِل)
    const currentUserId = req.user.id; 
    console.log("receiverid" , receiverId);

    try {
        // البحث عن وحذف الطلب المعلق الذي أرسله المستخدم الحالي إلى receiverId
        const result = await FriendRequest.findOneAndDelete({
            sender: currentUserId,
            receiver: receiverId,
            status: 'Pending', // تأكد من حذف الطلبات المعلقة فقط
        });

        if (!result) {
            // إذا لم يتم العثور على طلب (قد يكون لم يُرسل، أو تم قبوله/رفضه بالفعل)
            return res.status(404).json({ message: "No pending friend request found to cancel from you to this user." });
        }

        res.json({ 
            message: "Friend request cancelled successfully.", 
            receiverId: receiverId 
        });

    } catch (error) {
        console.error("Error cancelling friend request:", error);
        res.status(500).json({ message: "Server error while cancelling request." });
    }
})
// --- 2. قبول طلب صداقة (PUT /api/friends/accept/:requestId) ---
router.put("/accept/:requestId", AuthMiddleware, async (req, res) => {
  const receiverId = req.user.id;
  const { requestId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. تحديث حالة الطلب
    const request = await FriendRequest.findOneAndUpdate(
      { _id: requestId, receiver: receiverId, status: "Pending" },
      { status: "Accepted" },
      { new: true, session }
    );

    if (!request) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        message: "الطلب غير موجود أو غير معلّق أو ليس موجهاً إليك.",
      });
    }

    const senderId = request.sender;

    // 2. تحديث قائمة الأصدقاء لكلا الطرفين
    // استخدام $addToSet لضمان عدم تكرار ID
    await User.findByIdAndUpdate(
      receiverId,
      { $addToSet: { friends: senderId } },
      { session }
    );
    await User.findByIdAndUpdate(
      senderId,
      { $addToSet: { friends: receiverId } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // 3. إرسال تنبيه عبر السوكيت للمرسل (تم قبول طلبك)
    const io = req.app.get("io");
    if (io) {
      // إرسال تنبيه للمستخدم المُرسِل
      io.to(senderId).emit("friend_accepted", {
        accepterId: receiverId,
        message: `${req.user.username} قبل طلب صداقتك.`,
      });
    }

    res.status(200).json({ message: "تم قبول طلب الصداقة بنجاح." });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .json({ message: "فشل في قبول الطلب.", error: error.message });
  }
});

// --- 3. جلب الطلبات المعلقة الواردة (GET /api/friends/requests/pending) ---
router.get("/requests/pending", AuthMiddleware, async (req, res) => {
  const currentUserId = req.user.id;

  try {
    // البحث عن جميع الطلبات التي يكون المستخدم الحالي هو المُتَلَقِّي وحالتها معلّقة
    const pendingRequests = await FriendRequest.find({
      receiver: currentUserId,
      status: "Pending",
    }).populate("sender", "username avatar"); // جلب بيانات المُرسِل المطلوبة للعرض

    res.status(200).json(pendingRequests);
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في جلب الطلبات المعلقة.", error: error.message });
  }
});

// --- 4. جلب قائمة الأصدقاء (GET /friendrequist/friends) ---
router.get("/friends", AuthMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId)
      .select("friends")
      .populate("friends", "username profilePicture"); // جلب بيانات الأصدقاء

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود." });
    }

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error fetching friends list:", error);
    res
      .status(500)
      .json({ message: "فشل في جلب قائمة الأصدقاء.", error: error.message });
  }
});

//========================================== unfriend ========================================================
router.delete("/remove/:friendId", AuthMiddleware, async (req, res) => {
  // ID الصديق المراد حذفه
  const friendIdToRemove = req.params.friendId;
  // ID المستخدم الحالي
  const currentUserId = req.user.id;

  try {
    // 1. إزالة الصديق من قائمة أصدقاء المستخدم الحالي
    const userUpdateResult = await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { friends: friendIdToRemove } }, // $pull لإزالة العنصر من المصفوفة
      { new: true }
    );

    // 2. إزالة المستخدم الحالي من قائمة أصدقاء الطرف الآخر (للحفاظ على التناظر)
    const friendUpdateResult = await User.findByIdAndUpdate(
      friendIdToRemove,
      { $pull: { friends: currentUserId } },
      { new: true }
    );

    // 3. (اختياري) حذف أي طلبات صداقة سابقة معلقة بينهما (إذا وجدت)
    await FriendRequest.deleteMany({
      $or: [
        { sender: currentUserId, receiver: friendIdToRemove },
        { sender: friendIdToRemove, receiver: currentUserId },
      ],
    });

    if (!userUpdateResult || !friendUpdateResult) {
      return res.status(404).json({ message: "User or friend not found." });
    }

    res.json({
      message: "Friend removed successfully.",
      friendId: friendIdToRemove,
    });
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ message: "Server error while removing friend." });
  }
});

module.exports = router;
