import { createSlice } from "@reduxjs/toolkit";

type OnboardingStatus = "idle" | "started" | "completed" | "failed";

interface OnboardingState {
  status: OnboardingStatus;
}

const initialState: OnboardingState = {
  status: "idle",
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    onboardingStarted: (state) => {
      state.status = "started";
    },
    onboardingCompleted: (state) => {
      state.status = "completed";
    },
    onboardingFailed: (state) => {
      state.status = "failed";
    },
  },
});

export const { onboardingStarted, onboardingCompleted, onboardingFailed } = onboardingSlice.actions;
export default onboardingSlice.reducer;
