import type SignupCommand from "./Signup.types";
import type { IAuthRepository } from "../shared/api/types";
import type { AppDispatch } from "@/store";
import {
  signupStarted,
  signupCompleted,
  signupFailed,
} from "./Signup.slice";
import { signupSchema, SignupFormData } from "./Signup.schema";

export function signupUsecase(
  repository: IAuthRepository,
  dispatch: AppDispatch
) {
  return {
    execute: async (command: SignupFormData) => {
      dispatch(signupStarted());

      const validation = signupSchema.safeParse(command);
      if (!validation.success) {
        dispatch(signupFailed());
        return;
      }

      const result = await repository.signup({
        email: validation.data.email,
        password: validation.data.password,
      });

      if (result.success) {
        dispatch(signupCompleted());
      } else {
        dispatch(signupFailed());
      }
    },
  };
}
