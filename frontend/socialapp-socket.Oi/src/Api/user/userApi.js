// Need to use the React-specific entry point to import createApi
import { Email } from "@mui/icons-material";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// @ts-ignore
const allowedBaseUrls = import.meta.env.VITE_API_URL;

// Define a service using a base URL and expected endpoints
export const userApi = createApi({
  reducerPath: "userApi",
  tagTypes: ["User"],
  baseQuery: fetchBaseQuery({
    baseUrl: allowedBaseUrls,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getUserByName: builder.query({
      query: () => `/api/users/me/profile`,
      providesTags: ["User"],
    }),
    //get any user profile in website
    getUserByUserName: builder.query({
      query: (username) => `/api/users/${username}`,
      providesTags: ["User"],
    }),
    // ✅ Sign up new user
    signup: builder.mutation({
      query: (body) => ({
        url: "/api/users/register",
        method: "POST",
        body,
      }),
      // invalidatesTags: ["User"],
    }),

    // ✅ Sign in existing user
    signin: builder.mutation({
      query: (body) => ({
        url: "/api/users/login",
        method: "POST",
        body,
      }),
      // invalidatesTags: ["User"],
    }),
    //signout
    signOut: builder.mutation({
      query: () => ({
        url: "/api/users/logout",
        method: "POST",
      }),
      // invalidatesTags: ['User'],
    }),
    updateAvatar: builder.mutation({
      query: (formData) => ({
        url: "/api/users/edit",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
    //search
    searchUsers: builder.query({
      query: (query) => `/api/users/search?svalue=${query}`,
      providesTags: ["User"],
    }),
    //send forget password email
    sendEmailLink: builder.mutation({
      query: (email) => ({
        url: "/api/users/forget-password",
        method: "POST",
        body: email,
      }),
    }),
    //change password
    changePassword: builder.mutation({
      query: ({ password, token }) => ({
        url: "/api/users/reset-password",
        method: "PUT",
        body: { password, token },
      }),
    }),
    //delete account
    deletemyAccount: builder.mutation({
      query: () => ({
        url: `/api/users/deleteAccount`,
        method: "DELETE",
      }),
    }),
    //updatecover
    updateCover: builder.mutation({
      query: (formData) => ({
        url: "/api/users/editCover",
        method: "PUT",
        body:formData
      }),
      invalidatesTags: ["User"],
    }),
  }),
});
// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetUserByNameQuery,
  useGetUserByUserNameQuery,
  useSignupMutation,
  useSigninMutation,
  useSignOutMutation,
  useSearchUsersQuery,
  useUpdateAvatarMutation,
  useSendEmailLinkMutation,
  useChangePasswordMutation,
  useDeletemyAccountMutation,
  useUpdateCoverMutation,
} = userApi;
