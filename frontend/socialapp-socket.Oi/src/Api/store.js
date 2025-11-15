import { configureStore } from '@reduxjs/toolkit'
// Or from '@reduxjs/toolkit/query/react'
import { setupListeners } from '@reduxjs/toolkit/query'
import authReducer from "./user/authSlice"; // <--- استيراد authReducer
import { userApi } from './user/userApi'
import { postsApi } from './posts/postsApi';
import themeReducer from "./theme/themeSlice";
import { commentApi } from './comments/commentsApi';


export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [userApi.reducerPath]: userApi.reducer,
    [postsApi.reducerPath]: postsApi.reducer, // ربط الـ API بالستور
    [commentApi.reducerPath]:commentApi.reducer,
    auth: authReducer, //خاصه بحالة المستخدم
    theme: themeReducer,// theme
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userApi.middleware).concat(postsApi.middleware).concat(commentApi.middleware)
})

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch)