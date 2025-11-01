import { HttpServer } from "@infrastructure/http/HttpServer";
import ResendOtpController from "./resend-otp.controller";

export function registerResendOtpRoutes(
  server: HttpServer,
  controller: ResendOtpController
): void {
  server.post("/api/auth/resend-otp", async (request, response) => {
    try {
      const result = await controller.handle(request.body);
      response.status(result.status).send(result.body);
    } catch (error) {
      console.error("Unexpected error in resend OTP route:", error);
      response.status(500).send({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  });
}
