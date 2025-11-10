import { HttpServer } from "@infrastructure/http/HttpServer";
import UpdateProfileController from "./update-profile.controller";

export function registerUpdateProfileRoutes(
  server: HttpServer,
  controller: UpdateProfileController
): void {
  server.patch("/api/profile", async (request, response) => {
    try {
      const result = await controller.handle(request.body);
      response.status(result.status).send(result.body);
    } catch (error) {
      console.error("Unexpected error in update profile route:", error);
      response.status(500).send({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  });
}
