// src/features/posts/postsApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const postsApi = createApi({
  reducerPath: "postsApi",
  tagTypes: ["Post"],
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    // 🟢 جلب جميع البوستات
    getAllPosts: builder.query({
      query: () => "/api/posts",
      providesTags: ["Post"],
    }),
    // 🟢 جلب بوستات مستخدم معين
    getUserPosts: builder.query({
      query: (userId) => `/api/posts/${userId}`,
      providesTags: ["Post"],
    }),

    // 🟡 إنشاء بوست جديد
    createPost: builder.mutation({
      query: (formData) => ({
        url: "/api/posts",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Post"], //دي بتخلي getAllPosts يعيد الجلب تلقائيًا
    }),

    // 🔴 حذف بوست
    deletePost: builder.mutation({
      query: (postId) => ({
        url: `/api/posts/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Post"],
    }),
    deleteAllPosts: builder.mutation({
      query: () => ({
        url: `/api/posts/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Post"],
    }),
    editPost: builder.mutation({
      query: ({ postId, formData }) => ({
        url: `/api/posts/${postId}`,
        method: "PUT",
        body: formData,
        headers: {},
      }),
      invalidatesTags: ["Post"],
    }),
  }),
});

export const {
  useGetAllPostsQuery,
  useGetUserPostsQuery,
  useCreatePostMutation,
  useDeletePostMutation,
  useDeleteAllPostsMutation,
  useEditPostMutation,
} = postsApi;
