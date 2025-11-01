import Signup from "@features/signup/signup.usecase.js";
import VerifyOtp from "@features/verify-email/verify-otp.usecase.js";
import ResendOtp from "@features/resend-otp/resend-otp.usecase.js";
import { HelperRepository } from "@shared/domain/repositories/HelperRepository.js";
import AuthUserRepository from "@shared/domain/repositories/AuthUserRepository.js";
import { EmailConfirmationService } from "@shared/domain/services/EmailConfirmationService.js";
import { Clock } from "@shared/domain/services/Clock.js";
import EventBus from "@shared/infrastructure/EventBus.js";
import SignupController from "@features/signup/signup.controller.js";
import VerifyOtpController from "@features/verify-email/verify-otp.controller.js";
import ResendOtpController from "@features/resend-otp/resend-otp.controller.js";
import { registerSignupRoutes } from "@features/signup/signup.routes.js";
import { registerVerifyOtpRoutes } from "@features/verify-email/verify-otp.routes.js";
import { registerResendOtpRoutes } from "@features/resend-otp/resend-otp.routes.js";
import { registerTestHelperRoutes } from "@features/test-helpers/test-helpers.routes.js";
import { HttpServer } from "@infrastructure/http/HttpServer.js";

export interface AppDependencies {
  authUserRepository: AuthUserRepository;
}

export function createApp(
  server: HttpServer,
  dependencies: AppDependencies
): HttpServer {
  const signup = new Signup(dependencies.authUserRepository);

  const signupController = new SignupController(signup);

  const verifyOtp = new VerifyOtp(dependencies.authUserRepository);

  const verifyOtpController = new VerifyOtpController(verifyOtp);

  const resendOtp = new ResendOtp(dependencies.authUserRepository);

  const resendOtpController = new ResendOtpController(resendOtp);

  registerSignupRoutes(server, signupController);
  registerVerifyOtpRoutes(server, verifyOtpController);
  registerResendOtpRoutes(server, resendOtpController);
  registerTestHelperRoutes(server, dependencies.authUserRepository);

  server.get("/health", async (request, response) => {
    response.status(200).send({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  return server;
}
