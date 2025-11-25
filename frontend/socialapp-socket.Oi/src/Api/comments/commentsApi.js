// src/features/posts/postsApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// @ts-ignore
const appEnv = import.meta.env.VITE_APP_ENV;
const allowedBaseUrls =
  appEnv === "production"
    ? "https://socialmedia-socket-oi.onrender.com"
    : "http://localhost:3000";
export const commentApi = createApi({
  reducerPath: "commentApi",
  tagTypes: ["Comment"],
  baseQuery: fetchBaseQuery({
    baseUrl: allowedBaseUrls,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    // 🟢 جلب جميع الكومنتات لبوست معين
    getPostComments: builder.query({
      query: (postId) => `/api/comments/getComments/${postId}`,
      providesTags: ["Comment"],
    }),

    // 🟡 إنشاء كومنت جديد
    createComment: builder.mutation({
      query: ({ postId, text }) => ({
        url: `/api/comments/${postId}`,
        method: "POST",
        body: { text },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Comment"], //دي بتخلي getAllPosts يعيد الجلب تلقائيًا
    }),
    deleteComment: builder.mutation({
      query: (commentId) => ({
        url: `/api/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comment"], //دي بتخلي getAllPosts يعيد الجلب تلقائيًا
    }),

    //create reply
    createReply: builder.mutation({
      query: ({ commentId, replyText }) => ({
        url: `/api/comments/replay/${commentId}`,
        method: "POST",
        body: { replyText },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Comment"], // يعيد الجلب تلقائيًا
    }),

    deleteReply: builder.mutation({
      query: ({ commentId, replyId }) => ({
        url: `/api/comments/replay/${commentId}/${replyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comment"], //دي بتخلي getAllPosts يعيد الجلب تلقائيًا
    }),
  }),
});

export const {
  useGetPostCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useCreateReplyMutation,
  useDeleteReplyMutation,
} = commentApi;
