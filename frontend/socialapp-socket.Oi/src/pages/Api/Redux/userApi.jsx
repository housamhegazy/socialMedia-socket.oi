// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const userApi = createApi({
  reducerPath: 'userApi',
  tagTypes: ['User'],
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000', credentials: 'include'  }),
  endpoints: (builder) => ({
    getUserByName: builder.query({
      query: () => `/api/users/me/profile`,
      providesTags: ['User'],
    }),
     signOut: builder.mutation({
      query: () => ({
        url: '/api/users/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
  }),
})
// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetUserByNameQuery ,useSignOutMutation } = userApi