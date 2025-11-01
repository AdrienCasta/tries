import { createSlice } from "@reduxjs/toolkit";
import type { EmailVerificationState } from "./EmailVerification.types";

const initialState: EmailVerificationState = {
  isVerifying: false,
  isResending: false,
  verificationError: null,
  resendError: null,
  isVerified: false,
  lastResendTime: null,
};

const emailVerificationSlice = createSlice({
  name: "emailVerification",
  initialState,
  reducers: {
    verificationStarted: (state) => {
      state.isVerifying = true;
      state.verificationError = null;
    },
    verificationCompleted: (state) => {
      state.isVerifying = false;
      state.isVerified = true;
      state.verificationError = null;
    },
    verificationFailed: (state, action) => {
      state.isVerifying = false;
      state.verificationError = action.payload;
    },
    resendStarted: (state) => {
      state.isResending = true;
      state.resendError = null;
    },
    resendCompleted: (state) => {
      state.isResending = false;
      state.lastResendTime = Date.now();
      state.resendError = null;
    },
    resendFailed: (state, action) => {
      state.isResending = false;
      state.resendError = action.payload;
    },
    resetVerification: () => initialState,
  },
});

export const {
  verificationStarted,
  verificationCompleted,
  verificationFailed,
  resendStarted,
  resendCompleted,
  resendFailed,
  resetVerification,
} = emailVerificationSlice.actions;

export default emailVerificationSlice.reducer;
