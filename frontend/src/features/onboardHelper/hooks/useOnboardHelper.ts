import { useEffect } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { onboardHelperUseCase } from "../application/onboardHelper.usecase";
import { helperContainer } from "../infrastructure/di/helperContainer";
import type { OnboardHelperCommand } from "../types/OnboardHelperForm.types";

export function useOnboardHelper() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.onboarding.status);
  const repository = helperContainer.getHelperRepository();
  const useCase = onboardHelperUseCase(repository, dispatch);

  useEffect(() => {
    if (status === "completed") {
      toast.success("Helper onboarded successfully");
    }
  }, [status]);

  useEffect(() => {
    if (status === "failed") {
      toast.error("Failed to onboard helper");
    }
  }, [status]);

  const onboard = async (data: OnboardHelperCommand) => {
    await useCase.execute(data);
  };

  return {
    onboard,
    isLoading: status === "started",
    isSuccess: status === "completed",
    isFailed: status === "failed",
    status,
  };
}
