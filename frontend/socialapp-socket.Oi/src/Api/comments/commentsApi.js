// src/features/posts/postsApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const commentApi = createApi({
  reducerPath: "commentApi",
  tagTypes: ["Comment"],
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    // 🟢 جلب جميع الكومنتات لبوست معين
    getPostComments: builder.query({
      query: (postId) => `/api/comments/getComments/${postId}`,
      providesTags: ["Comment"],
    }),

    // 🟡 إنشاء بوست جديد
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
  }),
});

export const { useGetPostCommentsQuery, useCreateCommentMutation } = commentApi;
