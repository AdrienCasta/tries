import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ProfileService } from "./profileService";
import {
  profileCompletionStarted,
  profileCompletionSucceeded,
  profileCompletionFailed,
  profileCompletionSkipped,
} from "./ProfileCompletion.slice";
import { updateUserProfile } from "../auth/auth.slice";
import type { ProfileCompletionCommand } from "./ProfileCompletion.schema";

const profileService = new ProfileService();

export function useProfileCompletion() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.profileCompletion);
  const user = useAppSelector((state) => state.authState.user);

  const completeProfile = async (data: ProfileCompletionCommand) => {
    if (!user) {
      dispatch(profileCompletionFailed("User not authenticated"));
      return;
    }

    dispatch(profileCompletionStarted());

    const result = await profileService.completeProfile(user.id, data);

    if (result.success) {
      dispatch(
        updateUserProfile({
          firstname: data.firstname,
          lastname: data.lastname,
          hasCompletedProfile: true,
        })
      );
      dispatch(profileCompletionSucceeded());
    } else {
      dispatch(
        profileCompletionFailed(result.error || "Failed to update profile")
      );
    }
  };

  const skipCompletion = () => {
    dispatch(profileCompletionSkipped());
  };

  return {
    completeProfile,
    skipCompletion,
    isLoading: status === "started",
    isSuccess: status === "success",
    isSkipped: status === "skipped",
    error,
    user,
  };
}
