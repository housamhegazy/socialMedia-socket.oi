import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// @ts-ignore
const appEnv = import.meta.env.VITE_APP_ENV;
const allowedBaseUrls =
  appEnv === "production"
    ? "https://socialmedia-socket-oi.onrender.com"
    : "http://localhost:3000";
export const chatApi = createApi({
  reducerPath: "chatApi", // 💡 TagTypes: لتحديث قائمة المحادثات عند إرسال رسالة جديدة عبر السوكيت
  tagTypes: ["ChatList", "ChatMessages"],
  baseQuery: fetchBaseQuery({
    baseUrl: allowedBaseUrls,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    // 🟢 جلب قائمة جميع المحادثات للمستخدم الحالي
    // GET /api/chats
    // لجلب قائمة الدردشه 
    getUserChats: builder.query({
      query: () => `/api/chat`,
      providesTags: ["ChatList"], // هذا الـ Tag يتم تحديثه عند إرسال رسالة جديدة
    }), // 🟡 إنشاء محادثة جديدة أو جلب محادثة موجودة بين طرفين // POST /api/chats
// 💡 نقطة الوصول الجديدة: جلب تفاصيل محادثة واحدة بالـ ID
    getChatDetails: builder.query({
      query: (chatId) => `/api/chat/${chatId}`, // 👈 المسار المطلوب في الباك إند
      // نستخدم الـ Tag لتحديث البيانات إذا تغيرت تفاصيل المحادثة (مثلاً إرسال آخر رسالة)
      providesTags: (result, error, chatId) => [
        { type: "ChatList", id: chatId },
      ],
    }),
    createChat: builder.mutation({
      query: ({ receiverId }) => ({
        url: `/api/chat`,
        method: "POST",
        body: { receiverId },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["ChatList"],
    }), // 💬 جلب الرسائل التاريخية لمحادثة معينة (قد تدمج في ملف آخر) // GET /api/messages/:chatId
    getMessages: builder.query({
      query: (chatId) => `/api/messages/${chatId}`, // لا نستخدم invalidatesTags/providesTags لأن تحديث الرسائل يتم عبر السوكيت // نستخدم 'ChatMessages' فقط كمرجع إذا أردت تحديثها يدوياً
      providesTags: (result, error, chatId) => [
        { type: "ChatMessages", id: chatId },
      ],
    }),
    deleteChat: builder.mutation({
      query: (chatId) => ({
        url: `/api/chat/delete/${chatId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ChatList"],
    }),
  }),
});

export const {
  useGetUserChatsQuery,
  useGetChatDetailsQuery,
  useCreateChatMutation,
  useGetMessagesQuery,
  useDeleteChatMutation,
} = chatApi;