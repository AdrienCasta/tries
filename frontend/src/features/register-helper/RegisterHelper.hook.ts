import { useEffect } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerHelperUsecase } from "./RegisterHelper.usecase";
import { HttpHelperRepository } from "../shared/api/helperRepository";
import type RegisterHelperCommand from "./RegisterHelper.types";

export function useRegisterHelper() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.onboardHelper.status);
  const repository = new HttpHelperRepository();
  const handler = registerHelperUsecase(repository, dispatch);

  useEffect(() => {
    if (status === "completed") {
      toast.success(
        "Helper registered successfully! Please confirm your email to activate your account."
      );
    }
  }, [status]);

  useEffect(() => {
    if (status === "failed") {
      toast.error("Failed to onboard helper");
    }
  }, [status]);

  const onboard = async (command: RegisterHelperCommand) => {
    await handler.execute(command);
  };

  return {
    onboard,
    isLoading: status === "started",
    isSuccess: status === "completed",
    isFailed: status === "failed",
    status,
  };
}
