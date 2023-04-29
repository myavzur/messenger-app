import { configureStore } from "@reduxjs/toolkit";

import { baseApi } from "@/shared/api";

import { rootReducer } from "./root.reducer";

export const store = configureStore({
	devTools: process.env.NODE_ENV !== "production",
	reducer: rootReducer,
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware().concat(baseApi.middleware)
});

export type IStoreState = ReturnType<typeof store.getState>;
export type IStoreDispatch = typeof store.dispatch;
