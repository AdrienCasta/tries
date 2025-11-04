import { createSlice } from "@reduxjs/toolkit";

export interface AuthState {
  status: "idle" | "started" | "completed" | "failed";
}

const initialState: AuthState = {
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authStarted: (state) => {
      state.status = "started";
    },
    authCompleted: (state) => {
      state.status = "completed";
    },
    authFailed: (state) => {
      state.status = "failed";
    },
    authReset: (state) => {
      state.status = "idle";
    },
  },
});

export const { authStarted, authCompleted, authFailed, authReset } =
  authSlice.actions;

export default authSlice.reducer;
