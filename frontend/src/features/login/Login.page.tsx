import { useAppDispatch, useAppSelector } from "@/store/hooks";
import LoginForm from "./LoginForm";
import { loginUsecase } from "./Login.usecase";
import { AuthRepository } from "../shared/api/authRepository";
import type { LoginCommand } from "./Login.schema";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { isLoading, otpSent } = useAppSelector((state) => state.login);
  const navigate = useNavigate();

  const repository = new AuthRepository();
  const usecase = loginUsecase(repository, dispatch);

  const handleSubmit = async (data: LoginCommand) => {
    await usecase.execute(data);
  };

  useEffect(() => {
    if (otpSent) {
      navigate("/verify-email");
    }
  }, [otpSent, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
