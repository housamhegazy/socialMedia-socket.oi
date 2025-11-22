import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const friendRequistApi = createApi({
  reducerPath: "friendRequistApi",
  tagTypes: ["FriendRequist", "Friends"],
  baseQuery: fetchBaseQuery({
    baseUrl: "https://socialmedia-socket-oi.onrender.com",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    sendRequist: builder.mutation({
      query: ({ receiverId }) => ({
        url: `/api/friendrequist/request`,
        method: "POST",
        body: { receiverId },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["FriendRequist"],
    }),
    // 5. جلب حالة العلاقة بين المستخدمين (Query) بعد ارسال الطلب لتغيير الزر من اضافة صديق الى زر تم الارسال
    getFriendshipStatus: builder.query({
      query: (otherUserId) => `/api/friendrequist/status/${otherUserId}`,
      // يوفر وسم يسمح بتحديثه عند إرسال أو قبول الطلب
      providesTags: (result, error, otherUserId) => [
        { type: "FriendRequist", id: otherUserId },
      ],
    }),
    // 2. جلب الطلبات الواردة (مُضافة حديثًا لكي يستخدمها المتلقي)
    getPendingRequests: builder.query({
      query: () => `/api/friendrequist/requests/pending`,
      providesTags: ["FriendRequist"],
    }),
    // 3. قبول الطلب (مُضافة حديثًا)
    acceptRequest: builder.mutation({
      // requestId هو مُعرِّف وثيقة الطلب في MongoDB
      query: (requestId) => ({
        url: `/api/friendrequist/accept/${requestId}`,
        method: "PUT", // استخدمنا PUT في الباك إند
      }),
      // تحديث قائمة الطلبات وقائمة الأصدقاء
      invalidatesTags: ["FriendRequist", "Friends"],
    }),
    // cancel friend requist
    cancelFriendRequist: builder.mutation({
      // requestId هو مُعرِّف وثيقة الطلب في MongoDB
      query: (receiverId) => ({
        url: `/api/friendrequist/cancel/${receiverId}`,
        method: "DELETE",
      }),
      // تحديث قائمة الطلبات وقائمة الأصدقاء
      invalidatesTags: (result, error, receiverId) => [
        { type: "FriendRequist", id: receiverId },
      ],
    }),

    // 4. جلب قائمة الأصدقاء (Query)
    getFriendsList: builder.query({
      // المسار الحالي: ما زال /friendrequist/friends في ملف الراوتر
      query: () => `/api/friendrequist/friends`,
      // تزويد البيانات بوسم "Friends"
      providesTags: ["Friends"],
    }),

    // 6. حذف صديق (Mutation)
    removeFriend: builder.mutation({
      query: (friendId) => ({
        // نستخدم طريقة DELETE للـ REST best practices
        url: `/api/friendrequist/remove/${friendId}`,
        method: "DELETE",
      }),
      // 💡 تحديث الوسوم:
      // 1. Friends: لتحديث قائمة الأصدقاء
      // 2. FriendRequist مع id: لتحديث حالة الزر على صفحة الملف الشخصي
      invalidatesTags: (result, error, friendId) => [
        "Friends",
        { type: "FriendRequist", id: friendId },
      ],
    }),
  }),
});

export const {
  useSendRequistMutation,
  useGetFriendshipStatusQuery,
  useGetPendingRequestsQuery,
  useAcceptRequestMutation,
  useCancelFriendRequistMutation,
  useGetFriendsListQuery,
  useRemoveFriendMutation,
} = friendRequistApi;
