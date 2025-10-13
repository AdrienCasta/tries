import { createSlice } from "@reduxjs/toolkit";

type OnboardHelperStatus = "idle" | "started" | "completed" | "failed";

interface OnboardHelperState {
  status: OnboardHelperStatus;
}

const initialState: OnboardHelperState = {
  status: "idle",
};

const onboardHelperSlice = createSlice({
  name: "onboardHelper",
  initialState,
  reducers: {
    onboardHelperStarted: (state) => {
      state.status = "started";
    },
    onboardHelperCompleted: (state) => {
      state.status = "completed";
    },
    onboardHelperFailed: (state) => {
      state.status = "failed";
    },
  },
});

export const { onboardHelperStarted, onboardHelperCompleted, onboardHelperFailed } = onboardHelperSlice.actions;
export default onboardHelperSlice.reducer;
