import type { AuthService } from "../shared/api/types";
import type { AppDispatch } from "@/store";
import {
  verificationStarted,
  verificationCompleted,
  verificationFailed,
  resendStarted,
  resendCompleted,
  resendFailed,
} from "./EmailVerification.slice";
import { setUser } from "../auth/auth.slice";
import {
  emailVerificationSchema,
  type EmailVerificationFormData,
} from "./EmailVerification.schema";

export function verifyEmailUsecase(
  repository: AuthService,
  dispatch: AppDispatch
) {
  return {
    execute: async (data: EmailVerificationFormData) => {
      dispatch(verificationStarted());

      const validation = emailVerificationSchema.safeParse(data);
      if (!validation.success) {
        dispatch(verificationFailed("Format d'email ou de code OTP invalide"));
        return;
      }

      const result = await repository.verifyOtp({
        email: validation.data.email,
        otpCode: validation.data.otpCode,
      });

      if (result.success) {
        dispatch(setUser(result.user));
        dispatch(verificationCompleted());
      } else {
        dispatch(
          verificationFailed(result.error || "Échec de la vérification")
        );
      }
    },
  };
}

export function resendOtpUsecase(
  repository: AuthService,
  dispatch: AppDispatch
) {
  return {
    execute: async (email: string) => {
      dispatch(resendStarted());

      const result = await repository.resendOtp({ email });

      if (result.success) {
        dispatch(resendCompleted());
      } else {
        dispatch(resendFailed(result.error || "Échec du renvoi du code OTP"));
      }
    },
  };
}
