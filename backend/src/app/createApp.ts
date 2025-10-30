import { ConfirmHelperEmail } from "@features/confirm-helper-email/ConfirmHelperEmail.usecase.js";
import RegisterHelper from "@features/registerHelper/registerHelper.usecase.js";
import { HelperRepository } from "@shared/domain/repositories/HelperRepository.js";
import AuthUserRepository from "@shared/domain/repositories/AuthUserRepository.js";
import { EmailConfirmationService } from "@shared/domain/services/EmailConfirmationService.js";
import { Clock } from "@shared/domain/services/Clock.js";
import EventBus from "@shared/infrastructure/EventBus.js";
import ConfirmHelperEmailController from "@features/confirm-helper-email/ConfirmHelperEmail.controller.js";
import RegisterHelperController from "@features/registerHelper/registerHelper.controller.js";
import { registerConfirmEmailRoutes } from "@features/confirm-helper-email/ConfirmHelperEmail.routes.js";
import { registerRegisterHelperRoutes } from "@features/registerHelper/registerHelper.routes.js";
import { HttpServer } from "@infrastructure/http/HttpServer.js";

export interface AppDependencies {
  helperRepository: HelperRepository;
  authUserRepository: AuthUserRepository;
  emailConfirmationService: EmailConfirmationService;
  clock: Clock;
  eventBus: EventBus;
}

export function createApp(
  server: HttpServer,
  dependencies: AppDependencies
): HttpServer {
  const confirmHelperEmail = new ConfirmHelperEmail(
    dependencies.emailConfirmationService,
    dependencies.authUserRepository,
    dependencies.helperRepository
  );

  const confirmHelperEmailController = new ConfirmHelperEmailController(
    confirmHelperEmail,
    dependencies.eventBus,
    dependencies.clock
  );

  const registerHelper = new RegisterHelper(
    dependencies.authUserRepository,
    dependencies.clock
  );

  const registerHelperController = new RegisterHelperController(registerHelper);

  registerConfirmEmailRoutes(server, confirmHelperEmailController);
  registerRegisterHelperRoutes(server, registerHelperController);

  server.get("/health", async (request, response) => {
    response.status(200).send({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  return server;
}
