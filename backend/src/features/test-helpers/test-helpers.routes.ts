import { HttpServer } from "@infrastructure/http/HttpServer.js";
import InMemoryAuthUserRepository from "@infrastructure/persistence/InMemoryAuthUserRepository";
import AuthUserRepository from "@shared/domain/repositories/AuthUserRepository.js";

export function registerTestHelperRoutes(
  server: HttpServer,
  authUserRepository: AuthUserRepository
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

    if (authUserRepository instanceof InMemoryAuthUserRepository) {
      const otpCode = authUserRepository.getLastOtpCode(
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
          "Test OTP retrieval only available with InMemoryAuthUserRepository",
      });
    }
  });
}
