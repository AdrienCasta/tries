import { configureStore } from "@reduxjs/toolkit";
import onboardHelperReducer from "../features/register-helper/RegisterHelper.slice";

export const store = configureStore({
  reducer: {
    onboardHelper: onboardHelperReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
