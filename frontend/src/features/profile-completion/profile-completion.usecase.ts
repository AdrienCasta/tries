import type { AppDispatch } from "@/store";
import type { ProfileCompletionCommand } from "./ProfileCompletion.schema";
import {
  profileCompletionStarted,
  profileCompletionSucceeded,
  profileCompletionFailed,
} from "./ProfileCompletion.slice";
import { Result } from "@/shared/infrastructure/Result";

export interface ProfileRepository {
  update(
    profileId: string,
    request: ProfileCompletionCommand
  ): Promise<Result<void, Error>>;
}

export function completeProfile(
  profileRepository: ProfileRepository,
  dispatch: AppDispatch
) {
  return {
    async execute(userId: string, command: ProfileCompletionCommand) {
      dispatch(profileCompletionStarted());
      const result = await profileRepository.update(userId, command);
      if (Result.isSuccess(result)) {
        dispatch(profileCompletionSucceeded());
      } else {
        dispatch(profileCompletionFailed(result.error.message));
      }
    },
  };
}
