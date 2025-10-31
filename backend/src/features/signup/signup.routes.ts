import SignupController from "./signup.controller";
import { HttpServer } from "@infrastructure/http/HttpServer";

export function registerSignupRoutes(
  server: HttpServer,
  signupController: SignupController
): void {
  server.post("/api/auth/signup", async (request, response) => {
    try {
      const result = await signupController.handle(request.body);
      response.status(result.status).send(result.body);
    } catch (error) {
      console.error("Unexpected error in signup route:", error);
      response.status(500).send({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  });
}
