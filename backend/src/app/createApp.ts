import { OnboardHelper } from "@features/onboard-helper/OnboardHelper.usecase.js";
import { ConfirmHelperEmail } from "@features/confirm-helper-email/ConfirmHelperEmail.usecase.js";
import RegisterHelper from "@features/registerHelper/registerHelper.usecase.js";
import { HelperRepository } from "@shared/domain/repositories/HelperRepository.js";
import { AuthRepository } from "@shared/domain/repositories/HelperAccountRepository.js";
import AuthUserRepository from "@shared/domain/repositories/AuthUserRepository.js";
import { OnboardedHelperNotificationService } from "@shared/domain/services/OnboardingHelperNotificationService.js";
import { EmailConfirmationService } from "@shared/domain/services/EmailConfirmationService.js";
import { Clock } from "@shared/domain/services/Clock.js";
import EventBus from "@shared/infrastructure/EventBus.js";
import OnboardHelperController from "@features/onboard-helper/OnboardHelper.controller.js";
import ConfirmHelperEmailController from "@features/confirm-helper-email/ConfirmHelperEmail.controller.js";
import RegisterHelperController from "@features/registerHelper/registerHelper.controller.js";
import { registerHelperRoutes } from "@features/onboard-helper/OnboardHelper.routes.js";
import { registerConfirmEmailRoutes } from "@features/confirm-helper-email/ConfirmHelperEmail.routes.js";
import { registerRegisterHelperRoutes } from "@features/registerHelper/registerHelper.routes.js";
import { HttpServer } from "@infrastructure/http/HttpServer.js";

export interface AppDependencies {
  helperRepository: HelperRepository;
  helperAccountRepository: AuthRepository;
  authUserRepository: AuthUserRepository;
  notificationService: OnboardedHelperNotificationService;
  emailConfirmationService: EmailConfirmationService;
  clock: Clock;
  eventBus: EventBus;
}

/**
 * Framework-agnostic app creation
 *
 * Creates and configures the HTTP server using dependency injection.
 * The actual HTTP framework is abstracted behind the HttpServer interface.
 */
export function createApp(
  server: HttpServer,
  dependencies: AppDependencies
): HttpServer {
  const onboardHelper = new OnboardHelper(
    dependencies.helperRepository,
    dependencies.helperAccountRepository,
    dependencies.notificationService,
    dependencies.clock
  );

  const confirmHelperEmail = new ConfirmHelperEmail(
    dependencies.emailConfirmationService,
    dependencies.authUserRepository,
    dependencies.helperRepository
  );

  const onboardHelperController = new OnboardHelperController(
    onboardHelper,
    dependencies.eventBus,
    dependencies.clock
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

  const registerHelperController = new RegisterHelperController(
    registerHelper
  );

  registerHelperRoutes(server, onboardHelperController);
  registerConfirmEmailRoutes(server, confirmHelperEmailController);
  registerRegisterHelperRoutes(server, registerHelperController);

  return server;
}
