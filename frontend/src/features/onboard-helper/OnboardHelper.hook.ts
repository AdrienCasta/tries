import { useEffect } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { onboardHelperUsecase } from "./OnboardHelper.usecase";
import { HttpHelperRepository } from "../shared/api/helperRepository";
import type { OnboardHelperCommand } from "./OnboardHelper.types";

export function useOnboardHelper() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.onboardHelper.status);
  const repository = new HttpHelperRepository();
  const handler = onboardHelperUsecase(repository, dispatch);

  useEffect(() => {
    if (status === "completed") {
      toast.success("Helper registered successfully! Please confirm your email to activate your account.");
    }
  }, [status]);

  useEffect(() => {
    if (status === "failed") {
      toast.error("Failed to onboard helper");
    }
  }, [status]);

  const onboard = async (command: OnboardHelperCommand) => {
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
