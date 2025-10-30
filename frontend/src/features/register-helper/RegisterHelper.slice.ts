import { createSlice } from "@reduxjs/toolkit";

type RegisterHelperStatus = "idle" | "started" | "completed" | "failed";

interface RegisterHelperState {
  status: RegisterHelperStatus;
}

const initialState: RegisterHelperState = {
  status: "idle",
};

const registerHelperSlice = createSlice({
  name: "registerHelper",
  initialState,
  reducers: {
    registerHelperStarted: (state) => {
      state.status = "started";
    },
    registerHelperCompleted: (state) => {
      state.status = "completed";
    },
    registerHelperFailed: (state) => {
      state.status = "failed";
    },
  },
});

export const {
  registerHelperStarted,
  registerHelperCompleted,
  registerHelperFailed,
} = registerHelperSlice.actions;
export default registerHelperSlice.reducer;
