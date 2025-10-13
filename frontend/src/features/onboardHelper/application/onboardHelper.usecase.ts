import type { OnboardHelperCommand } from "../types/OnboardHelperForm.types";
import type { IHelperRepository } from "../domain/interfaces/IHelperRepository";
import type { AppDispatch } from "@/store";
import {
  onboardingStarted,
  onboardingCompleted,
  onboardingFailed,
} from "../store/onboardingSlice";
import { onboardHelperSchema } from "../validators/schema";

export function onboardHelperUseCase(
  repository: IHelperRepository,
  dispatch: AppDispatch
) {
  return {
    execute: async (command: OnboardHelperCommand) => {
      dispatch(onboardingStarted());

      const validation = onboardHelperSchema.safeParse(command);
      if (!validation.success) {
        dispatch(onboardingFailed());
        return;
      }

      const result = await repository.onboard(command);

      if (result.success) {
        dispatch(onboardingCompleted());
      } else {
        dispatch(onboardingFailed());
      }
    },
  };
}
