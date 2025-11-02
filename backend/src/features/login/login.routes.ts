import { HttpServer } from "@infrastructure/http/HttpServer.js";
import LoginController, { LoginRequest } from "./login.controller.js";

export function registerLoginRoutes(
  server: HttpServer,
  loginController: LoginController
) {
  server.post("/api/login", async (request, response) => {
    const loginRequest = request.body as LoginRequest;
    const result = await loginController.handle(loginRequest);

    response.status(result.status).send(result.body);
  });
}
