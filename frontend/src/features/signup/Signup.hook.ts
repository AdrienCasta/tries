import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signupUsecase } from "./Signup.usecase";
import { AuthService } from "../shared/api/authService";
import type SignupRequest from "./Signup.types";

export function useSignup() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector((state) => state.signup.status);
  const repository = new AuthService();
  const handler = signupUsecase(repository, dispatch);
  const [signupEmail, setSignupEmail] = useState<string>("");

  useEffect(() => {
    if (status === "completed" && signupEmail) {
      toast.success(
        "Inscription réussie ! Nous vous avons envoyé un code de vérification par email."
      );
      navigate(`/verify-email?email=${encodeURIComponent(signupEmail)}`);
    }
  }, [status, signupEmail, navigate]);

  useEffect(() => {
    if (status === "failed") {
      toast.error("Échec de l'inscription");
    }
  }, [status]);

  const signup = async (command: SignupRequest) => {
    setSignupEmail(command.email);
    await handler.execute(command);
  };

  return {
    signup,
    isLoading: status === "started",
    isSuccess: status === "completed",
    isFailed: status === "failed",
    status,
  };
}
