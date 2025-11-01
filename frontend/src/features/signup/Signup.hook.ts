import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signupUsecase } from "./Signup.usecase";
import { AuthRepository } from "../shared/api/authRepository";
import type SignupCommand from "./Signup.types";

export function useSignup() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.signup.status);
  const repository = new AuthRepository();
  const handler = signupUsecase(repository, dispatch);
  const [signupEmail, setSignupEmail] = useState<string>("");

  useEffect(() => {
    if (status === "completed" && signupEmail) {
      toast.success(
        "User signed up successfully! Please confirm your email to activate your account."
      );
      window.location.href = `/verify-email?email=${encodeURIComponent(signupEmail)}`;
    }
  }, [status, signupEmail]);

  useEffect(() => {
    if (status === "failed") {
      toast.error("Failed to sign up");
    }
  }, [status]);

  const signup = async (command: SignupCommand) => {
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
