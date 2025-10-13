import type { OnboardHelperCommand } from "./OnboardHelper.types";
import type { IHelperRepository } from "../shared/api/types";
import type { AppDispatch } from "@/store";
import {
  onboardHelperStarted,
  onboardHelperCompleted,
  onboardHelperFailed,
} from "./OnboardHelper.slice";
import { onboardHelperSchema } from "./OnboardHelper.schema";

export function onboardHelperUsecase(
  repository: IHelperRepository,
  dispatch: AppDispatch
) {
  return {
    execute: async (command: OnboardHelperCommand) => {
      dispatch(onboardHelperStarted());

      const validation = onboardHelperSchema.safeParse(command);
      if (!validation.success) {
        dispatch(onboardHelperFailed());
        return;
      }

      const result = await repository.onboard(command);

      if (result.success) {
        dispatch(onboardHelperCompleted());
      } else {
        dispatch(onboardHelperFailed());
      }
    },
  };
}
