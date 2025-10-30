import type RegisterHelperCommand from "./RegisterHelper.types";
import type { IHelperRepository } from "../shared/api/types";
import type { AppDispatch } from "@/store";
import {
  registerHelperStarted,
  registerHelperCompleted,
  registerHelperFailed,
} from "./RegisterHelper.slice";
import { registerHelperSchema } from "./RegisterHelper.schema";

export function registerHelperUsecase(
  repository: IHelperRepository,
  dispatch: AppDispatch
) {
  return {
    execute: async (command: RegisterHelperCommand) => {
      dispatch(registerHelperStarted());

      const validation = registerHelperSchema.safeParse(command);
      if (!validation.success) {
        dispatch(registerHelperFailed());
        return;
      }

      const result = await repository.onboard(command);

      if (result.success) {
        dispatch(registerHelperCompleted());
      } else {
        dispatch(registerHelperFailed());
      }
    },
  };
}
