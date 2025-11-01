import { configureStore } from "@reduxjs/toolkit";
import onboardHelperReducer from "../features/register-helper/RegisterHelper.slice";
import signupReducer from "../features/signup/Signup.slice";
import emailVerificationReducer from "../features/email-verification/EmailVerification.slice";

export const store = configureStore({
  reducer: {
    onboardHelper: onboardHelperReducer,
    signup: signupReducer,
    emailVerification: emailVerificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
