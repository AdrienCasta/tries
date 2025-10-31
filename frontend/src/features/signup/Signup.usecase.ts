import type SignupCommand from "./Signup.types";
import type { IAuthRepository } from "../shared/api/types";
import type { AppDispatch } from "@/store";
import {
  signupStarted,
  signupCompleted,
  signupFailed,
} from "./Signup.slice";
import { signupSchema } from "./Signup.schema";

export function signupUsecase(
  repository: IAuthRepository,
  dispatch: AppDispatch
) {
  return {
    execute: async (command: SignupCommand) => {
      dispatch(signupStarted());

      const validation = signupSchema.safeParse(command);
      if (!validation.success) {
        dispatch(signupFailed());
        return;
      }

      const result = await repository.signup(command);

      if (result.success) {
        dispatch(signupCompleted());
      } else {
        dispatch(signupFailed());
      }
    },
  };
}
