import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chatApi = createApi({
  reducerPath: "chatApi", // 💡 TagTypes: لتحديث قائمة المحادثات عند إرسال رسالة جديدة عبر السوكيت
  tagTypes: ["ChatList", "ChatMessages"],
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    // 🟢 جلب قائمة جميع المحادثات للمستخدم الحالي
    // GET /api/chats
    getUserChats: builder.query({
      query: () => `/api/chat`,
      providesTags: ["ChatList"], // هذا الـ Tag يتم تحديثه عند إرسال رسالة جديدة
    }), // 🟡 إنشاء محادثة جديدة أو جلب محادثة موجودة بين طرفين // POST /api/chats

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
  }),
});

export const {
  useGetUserChatsQuery,
  useCreateChatMutation,
  useGetMessagesQuery,
} = chatApi;
