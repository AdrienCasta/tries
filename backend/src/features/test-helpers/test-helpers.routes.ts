import { HttpServer } from "@infrastructure/http/HttpServer.js";
import InMemoryAuthService from "@infrastructure/auth/InMemoryAuthService.js";
import AuthService from "@shared/domain/services/AuthService.js";

export function registerTestHelperRoutes(
  server: HttpServer,
  authService: AuthService
) {
  if (process.env.NODE_ENV !== "test") {
    return;
  }

  server.get("/test/otp/:email", async (request, response) => {
    const email = (request.params as { email: string }).email;

    if (!email) {
      response.status(400).send({ error: "Email is required" });
      return;
    }

    if (authService instanceof InMemoryAuthService) {
      const otpCode = authService.getLastOtpCode(
        decodeURIComponent(email)
      );

      if (!otpCode) {
        response.status(404).send({ error: "No OTP found for this email" });
        return;
      }

      response.status(200).send({ otpCode });
    } else {
      response.status(501).send({
        error:
          "Test OTP retrieval only available with InMemoryAuthService",
      });
    }
  });
}
