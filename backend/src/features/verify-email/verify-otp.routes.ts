import { HttpServer } from "@infrastructure/http/HttpServer";
import VerifyOtpController from "./verify-otp.controller";

export function registerVerifyOtpRoutes(
  server: HttpServer,
  controller: VerifyOtpController
): void {
  server.post("/api/auth/verify-otp", async (request, response) => {
    try {
      const result = await controller.handle(request.body);
      response.status(result.status).send(result.body);
    } catch (error) {
      console.error("Unexpected error in verify OTP route:", error);
      response.status(500).send({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  });
}
