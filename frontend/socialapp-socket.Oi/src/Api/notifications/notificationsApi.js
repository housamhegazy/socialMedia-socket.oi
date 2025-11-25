// src/Api/notifications/notificationsApi.js

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// @ts-ignore
const appEnv = import.meta.env.VITE_APP_ENV;
const allowedBaseUrls =
  appEnv === "production"
    ? "https://socialmedia-socket-oi.onrender.com"
    : "http://localhost:3000";
export const notificationApi = createApi({
  reducerPath: "notificationApi",
  tagTypes: ["Notification", "UnreadCount"], // 💡 تم إضافة Tag للعداد
  baseQuery: fetchBaseQuery({
    baseUrl: allowedBaseUrls,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => `/notifications`,
      providesTags: (result) =>
        result
          ? [
              ...result.map((notif) => ({
                type: "Notification",
                id: notif._id,
              })),
              { type: "Notification", id: "LIST" },
            ]
          : [{ type: "Notification", id: "LIST" }],
    }),

    // 🔥 1. جلب عدد الإشعارات غير المقروءة
    getUnreadCount: builder.query({
      query: () => `/notifications/unread-count`,
      providesTags: ["UnreadCount"],
    }),

    // 🔥 2. وضع علامة كمقروء (Mutation)
    markNotificationAsRead: builder.mutation({
      query: ({ notificationId, markAll = false }) => ({
        url: `/notifications/mark-read${
          markAll ? "/all" : `/${notificationId}`
        }`,
        method: "PATCH",
      }), // 💡 بمجرد نجاح هذه العملية، قم بتحديث العداد والقائمة
      invalidatesTags: (result, error, { markAll, notificationId }) => [
        "UnreadCount", // تحديث عداد الإشعارات فوراً
        // إذا كانت القراءة للكل، قم بتحديث قائمة الإشعارات بالكامل
        markAll
          ? { type: "Notification", id: "LIST" }
          : { type: "Notification", id: notificationId },
      ],
    }),
    deleteNotification: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/delete/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, notificationId) => [
        "UnreadCount",
        { type: "Notification", id: notificationId },
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;
