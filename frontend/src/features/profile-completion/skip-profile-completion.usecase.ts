import type { AppDispatch } from "@/store";
import { profileCompletionSkipped } from "./ProfileCompletion.slice";

export function skipCompleteProfile(dispatch: AppDispatch) {
  return {
    async execute() {
      dispatch(profileCompletionSkipped());
    },
  };
}
