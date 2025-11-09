import type { AppDispatch } from "@/store";
import type { ProfileCompletionCommand } from "./ProfileCompletion.schema";
import {
  profileCompletionStarted,
  profileCompletionSucceeded,
  profileCompletionFailed,
} from "./ProfileCompletion.slice";

type ProfileUpdateResponse = {
  success: boolean;
  message: string;
};

export interface ProfileRepository {
  update(
    profileId: string,
    request: ProfileCompletionCommand
  ): Promise<ProfileUpdateResponse>;
}

export function completeProfile(
  profileRepository: ProfileRepository,
  dispatch: AppDispatch
) {
  return {
    async execute(userId: string, command: ProfileCompletionCommand) {
      dispatch(profileCompletionStarted());
      const result = await profileRepository.update(userId, command);
      if (result.success) {
        dispatch(profileCompletionSucceeded());
      } else {
        dispatch(profileCompletionFailed(result.message));
      }
    },
  };
}
