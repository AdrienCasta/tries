import { createSlice } from "@reduxjs/toolkit";

export interface ProfileCompletionState {
  status: "idle" | "started" | "success" | "failed" | "skipped";
  error?: string;
}

const initialState: ProfileCompletionState = {
  status: "idle",
};

const profileCompletionSlice = createSlice({
  name: "profileCompletion",
  initialState,
  reducers: {
    profileCompletionStarted: (state) => {
      state.status = "started";
      state.error = undefined;
    },
    profileCompletionSucceeded: (state) => {
      state.status = "success";
      state.error = undefined;
    },
    profileCompletionFailed: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    },
    profileCompletionSkipped: (state) => {
      state.status = "skipped";
      state.error = undefined;
    },
    profileCompletionReset: (state) => {
      state.status = "idle";
      state.error = undefined;
    },
  },
});

export const {
  profileCompletionStarted,
  profileCompletionSucceeded,
  profileCompletionFailed,
  profileCompletionSkipped,
  profileCompletionReset,
} = profileCompletionSlice.actions;

export default profileCompletionSlice.reducer;
