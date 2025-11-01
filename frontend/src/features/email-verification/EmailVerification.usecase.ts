import type { IAuthRepository } from "../shared/api/types";
import type { AppDispatch } from "@/store";
import {
  verificationStarted,
  verificationCompleted,
  verificationFailed,
  resendStarted,
  resendCompleted,
  resendFailed,
} from "./EmailVerification.slice";
import {
  emailVerificationSchema,
  type EmailVerificationFormData,
} from "./EmailVerification.schema";

export function verifyEmailUsecase(
  repository: IAuthRepository,
  dispatch: AppDispatch
) {
  return {
    execute: async (data: EmailVerificationFormData) => {
      dispatch(verificationStarted());

      const validation = emailVerificationSchema.safeParse(data);
      if (!validation.success) {
        dispatch(verificationFailed("Invalid email or OTP format"));
        return;
      }

      const result = await repository.verifyOtp({
        email: validation.data.email,
        otpCode: validation.data.otpCode,
      });

      if (result.success) {
        dispatch(verificationCompleted());
      } else {
        dispatch(verificationFailed(result.error || "Verification failed"));
      }
    },
  };
}

export function resendOtpUsecase(
  repository: IAuthRepository,
  dispatch: AppDispatch
) {
  return {
    execute: async (email: string) => {
      dispatch(resendStarted());

      const result = await repository.resendOtp({ email });

      if (result.success) {
        dispatch(resendCompleted());
      } else {
        dispatch(resendFailed(result.error || "Failed to resend OTP"));
      }
    },
  };
}
