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
        "Aidant inscrit avec succès ! Veuillez confirmer votre email pour activer votre compte."
      );
    }
  }, [status]);

  useEffect(() => {
    if (status === "failed") {
      toast.error("Échec de l'inscription de l'aidant");
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
