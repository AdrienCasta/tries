import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  emailVerificationSchema,
  type EmailVerificationFormData,
} from "./EmailVerification.schema";
import { verifyEmailUsecase, resendOtpUsecase } from "./EmailVerification.usecase";
import { AuthRepository } from "../shared/api/authRepository";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const authRepository = new AuthRepository();

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
        <p className="text-red-500">No email provided. Please sign up first.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Verify Your Email</h1>
        <p className="text-muted-foreground">
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="otp" className="block text-sm font-medium text-center">
            Enter verification code
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
            <p className="text-sm text-red-500 text-center">{errors.otpCode.message}</p>
          )}
          {verificationError && (
            <p className="text-sm text-red-500 text-center">{verificationError}</p>
          )}
        </div>

        {isVerifying && (
          <p className="text-sm text-center text-muted-foreground">
            Verifying...
          </p>
        )}

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={!canResend || isResending}
            className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending
              ? "Sending..."
              : canResend
              ? "Resend Code"
              : `Resend in ${resendCooldown}s`}
          </button>
          {resendError && (
            <p className="text-sm text-red-500">{resendError}</p>
          )}
        </div>
      </form>
    </div>
  );
}
