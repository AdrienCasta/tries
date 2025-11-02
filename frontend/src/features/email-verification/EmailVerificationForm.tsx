import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  emailVerificationSchema,
  type EmailVerificationFormData,
} from "./EmailVerification.schema";
import {
  verifyEmailUsecase,
  resendOtpUsecase,
} from "./EmailVerification.usecase";
import { AuthService } from "../shared/api/authService";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const authRepository = new AuthService();

export default function EmailVerificationForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const {
    isVerifying,
    isResending,
    verificationError,
    resendError,
    isVerified,
    lastResendTime,
  } = useAppSelector((state) => state.emailVerification);

  const [otpValue, setOtpValue] = useState("");
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EmailVerificationFormData>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: {
      email,
      otpCode: "",
    },
  });

  useEffect(() => {
    if (lastResendTime) {
      const cooldownPeriod = 60000;
      const elapsed = Date.now() - lastResendTime;
      const remaining = cooldownPeriod - elapsed;

      if (remaining > 0) {
        setCanResend(false);
        setResendCooldown(Math.ceil(remaining / 1000));

        const interval = setInterval(() => {
          const newRemaining = cooldownPeriod - (Date.now() - lastResendTime);
          if (newRemaining <= 0) {
            setCanResend(true);
            setResendCooldown(0);
            clearInterval(interval);
          } else {
            setResendCooldown(Math.ceil(newRemaining / 1000));
          }
        }, 1000);

        return () => clearInterval(interval);
      }
    }
  }, [lastResendTime]);

  useEffect(() => {
    if (isVerified) {
      navigate("/dashboard");
    }
  }, [isVerified, navigate]);

  const onSubmit = async (data: EmailVerificationFormData) => {
    const usecase = verifyEmailUsecase(authRepository, dispatch);
    await usecase.execute(data);
  };

  const handleOtpChange = (value: string) => {
    setOtpValue(value);
    setValue("otpCode", value);

    if (value.length === 6) {
      handleSubmit(onSubmit)();
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || !email) return;

    const usecase = resendOtpUsecase(authRepository, dispatch);
    await usecase.execute(email);
  };

  if (!email) {
    return (
      <div className="text-center">
        <p className="text-red-500">
          Aucun email fourni. Veuillez vous inscrire d'abord.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Vérifiez votre email</h1>
        <p className="text-muted-foreground">
          Nous avons envoyé un code à 6 chiffres à <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="otp"
            className="block text-sm font-medium text-center"
          >
            Entrez le code de vérification
          </label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={handleOtpChange}
              disabled={isVerifying}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          {errors.otpCode && (
            <p className="text-sm text-red-500 text-center">
              {errors.otpCode.message}
            </p>
          )}
          {verificationError && (
            <p className="text-sm text-red-500 text-center">
              {verificationError}
            </p>
          )}
        </div>

        {isVerifying && (
          <p className="text-sm text-center text-muted-foreground">
            Vérification en cours...
          </p>
        )}

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Vous n'avez pas reçu le code ?
          </p>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={!canResend || isResending}
            className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending
              ? "Envoi en cours..."
              : canResend
              ? "Renvoyer le code"
              : `Renvoyer dans ${resendCooldown}s`}
          </button>
          {resendError && <p className="text-sm text-red-500">{resendError}</p>}
        </div>
      </form>
    </div>
  );
}
