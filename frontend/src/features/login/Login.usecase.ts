import type { IAuthRepository } from "../shared/api/types";
import type { AppDispatch } from "@/store";
import { loginStarted, loginCompleted, loginFailed } from "./Login.slice";
import { loginSchema, type LoginCommand } from "./Login.schema";

export function loginUsecase(
  repository: IAuthRepository,
  dispatch: AppDispatch
) {
  return {
    execute: async (command: LoginCommand) => {
      dispatch(loginStarted());

      const validation = loginSchema.safeParse(command);
      if (!validation.success) {
        dispatch(loginFailed());
        return;
      }

      const result = await repository.login({
        email: validation.data.email,
      });

      if (result.success) {
        dispatch(loginCompleted());
      } else {
        dispatch(loginFailed());
      }
    },
  };
}
