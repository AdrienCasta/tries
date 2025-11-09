import { configureStore } from "@reduxjs/toolkit";
import signupReducer from "../features/signup/Signup.slice";
import loginReducer from "../features/login/Login.slice";
import authReducer from "../features/auth/Auth.slice";
import authSliceReducer from "../features/auth/auth.slice";
import emailVerificationReducer from "../features/email-verification/EmailVerification.slice";
import profileCompletionReducer from "../features/profile-completion/ProfileCompletion.slice";

export const store = configureStore({
  reducer: {
    signup: signupReducer,
    login: loginReducer,
    auth: authReducer,
    authState: authSliceReducer,
    emailVerification: emailVerificationReducer,
    profileCompletion: profileCompletionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
