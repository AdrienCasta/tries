import { createSlice } from "@reduxjs/toolkit";

interface LoginState {
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
}

const initialState: LoginState = {
  isLoading: false,
  error: null,
  otpSent: false,
};

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    loginStarted: (state) => {
      state.isLoading = true;
      state.error = null;
      state.otpSent = false;
    },
    loginCompleted: (state) => {
      state.isLoading = false;
      state.otpSent = true;
    },
    loginFailed: (state) => {
      state.isLoading = false;
      state.error = "Login failed";
    },
    loginReset: (state) => {
      state.isLoading = false;
      state.error = null;
      state.otpSent = false;
    },
  },
});

export const { loginStarted, loginCompleted, loginFailed, loginReset } =
  loginSlice.actions;

export default loginSlice.reducer;
