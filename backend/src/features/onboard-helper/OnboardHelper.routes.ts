import OnboardHelperController from "./OnboardHelper.controller.js";
import { HttpServer } from "@infrastructure/http/HttpServer.js";

/**
 * Register helper-related routes
 *
 * Framework-agnostic route registration using the HttpServer interface
 */
export function registerHelperRoutes(
  server: HttpServer,
  onboardHelperController: OnboardHelperController
): void {
  server.post("/api/helpers/onboard", async (request, response) => {
    try {
      const result = await onboardHelperController.handle(request.body);
      response.status(result.status).send(result.body);
    } catch (error) {
      console.error("Unexpected error in onboard route:", error);
      response.status(500).send({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  });
}
