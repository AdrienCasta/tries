import type { AuthService } from "../shared/api/types";
import type { AppDispatch } from "@/store";
import { authStarted, authCompleted, authFailed } from "./Auth.slice";
import { authSchema, type AuthCommand } from "./Auth.schema";

export function authUsecase(repository: AuthService, dispatch: AppDispatch) {
  return {
    execute: async (command: AuthCommand) => {
      dispatch(authStarted());

      const validation = authSchema.safeParse(command);
      if (!validation.success) {
        dispatch(authFailed());
        return;
      }

      const result = await repository.authenticate({
        email: validation.data.email,
      });

      if (result.success) {
        dispatch(authCompleted());
      } else {
        dispatch(authFailed());
      }
    },
  };
}
