import RegisterHelperController from "./registerHelper.controller";
import { HttpServer } from "@infrastructure/http/HttpServer";

export function registerRegisterHelperRoutes(
  server: HttpServer,
  registerHelperController: RegisterHelperController
): void {
  server.post("/api/helpers/register", async (request, response) => {
    try {
      const result = await registerHelperController.handle(request.body);
      response.status(result.status).send(result.body);
    } catch (error) {
      console.error("Unexpected error in register route:", error);
      response.status(500).send({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  });
}
