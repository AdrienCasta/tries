import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { authUsecase } from "./Auth.usecase";
import { AuthService } from "../shared/api/authService";
import type { AuthCommand } from "./Auth.schema";

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector((state) => state.auth.status);
  const repository = new AuthService();
  const handler = authUsecase(repository, dispatch);
  const [authEmail, setAuthEmail] = useState<string>("");

  useEffect(() => {
    if (status === "completed" && authEmail) {
      toast.success(
        "Code envoyé ! Vérifiez vos emails."
      );
      navigate(`/verify-email?email=${encodeURIComponent(authEmail)}`);
    }
  }, [status, authEmail, navigate]);

  useEffect(() => {
    if (status === "failed") {
      toast.error("Échec de l'authentification");
    }
  }, [status]);

  const authenticate = async (command: AuthCommand) => {
    setAuthEmail(command.email);
    await handler.execute(command);
  };

  return {
    authenticate,
    isLoading: status === "started",
    isSuccess: status === "completed",
    isFailed: status === "failed",
    status,
  };
}
