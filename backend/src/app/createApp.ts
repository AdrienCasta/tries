import Signup from "@features/signup/signup.usecase.js";
import Login from "@features/login/login.usecase.js";
import VerifyOtp from "@features/verify-email/verify-otp.usecase.js";
import ResendOtp from "@features/resend-otp/resend-otp.usecase.js";
import { HelperRepository } from "@shared/domain/repositories/HelperRepository.js";
import AuthService from "@shared/domain/services/AuthService.js";
import UserRepository from "@shared/domain/repositories/UserRepository.js";
import { EmailConfirmationService } from "@shared/domain/services/EmailConfirmationService.js";
import { Clock } from "@shared/domain/services/Clock.js";
import EventBus from "@shared/infrastructure/EventBus.js";
import SignupController from "@features/signup/signup.controller.js";
import LoginController from "@features/login/login.controller.js";
import VerifyOtpController from "@features/verify-email/verify-otp.controller.js";
import ResendOtpController from "@features/resend-otp/resend-otp.controller.js";
import { registerSignupRoutes } from "@features/signup/signup.routes.js";
import { registerLoginRoutes } from "@features/login/login.routes.js";
import { registerVerifyOtpRoutes } from "@features/verify-email/verify-otp.routes.js";
import { registerResendOtpRoutes } from "@features/resend-otp/resend-otp.routes.js";
import { registerTestHelperRoutes } from "@features/test-helpers/test-helpers.routes.js";
import { HttpServer } from "@infrastructure/http/HttpServer.js";

export interface AppDependencies {
  authService: AuthService;
  userRepository: UserRepository;
}

export function createApp(
  server: HttpServer,
  dependencies: AppDependencies
): HttpServer {
  const signup = new Signup(dependencies.authService, dependencies.userRepository);
  const signupController = new SignupController(signup);

  const login = new Login(dependencies.authService);
  const loginController = new LoginController(login);

  const verifyOtp = new VerifyOtp(dependencies.authService);
  const verifyOtpController = new VerifyOtpController(verifyOtp);

  const resendOtp = new ResendOtp(dependencies.authService);
  const resendOtpController = new ResendOtpController(resendOtp);

  registerSignupRoutes(server, signupController);
  registerLoginRoutes(server, loginController);
  registerVerifyOtpRoutes(server, verifyOtpController);
  registerResendOtpRoutes(server, resendOtpController);
  registerTestHelperRoutes(server, dependencies.authService);

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
