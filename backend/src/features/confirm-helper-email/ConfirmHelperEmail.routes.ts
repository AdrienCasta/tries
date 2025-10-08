import ConfirmHelperEmailController from "./ConfirmHelperEmail.controller.js";
import { HttpServer } from "@infrastructure/http/HttpServer.js";

export function registerConfirmEmailRoutes(
  server: HttpServer,
  confirmHelperEmailController: ConfirmHelperEmailController
): void {
  server.post("/api/helpers/confirm-email", async (request, response) => {
    try {
      const result = await confirmHelperEmailController.handle(request.body);
      response.status(result.status).send(result.body);
    } catch (error) {
      console.error("Unexpected error in confirm email route:", error);
      response.status(500).send({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  });
}
