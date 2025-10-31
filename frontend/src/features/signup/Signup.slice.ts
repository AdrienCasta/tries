import { createSlice } from "@reduxjs/toolkit";

export interface SignupState {
  status: "idle" | "started" | "completed" | "failed";
}

const initialState: SignupState = {
  status: "idle",
};

const signupSlice = createSlice({
  name: "signup",
  initialState,
  reducers: {
    signupStarted: (state) => {
      state.status = "started";
    },
    signupCompleted: (state) => {
      state.status = "completed";
    },
    signupFailed: (state) => {
      state.status = "failed";
    },
    signupReset: (state) => {
      state.status = "idle";
    },
  },
});

export const { signupStarted, signupCompleted, signupFailed, signupReset } =
  signupSlice.actions;

export default signupSlice.reducer;
