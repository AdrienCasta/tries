// import type SignupCommand from "./Signup.types";
import type { AuthService } from "../shared/api/types";
import type { AppDispatch } from "@/store";
import { signupStarted, signupCompleted, signupFailed } from "./Signup.slice";
import { signupSchema, type SignupCommand } from "./Signup.schema";

export function signupUsecase(repository: AuthService, dispatch: AppDispatch) {
  return {
    execute: async (command: SignupCommand) => {
      dispatch(signupStarted());

      const validation = signupSchema.safeParse(command);
      if (!validation.success) {
        dispatch(signupFailed());
        return;
      }

      const result = await repository.signup({
        email: validation.data.email,
      });

      if (result.success) {
        dispatch(signupCompleted());
      } else {
        dispatch(signupFailed());
      }
    },
  };
}
