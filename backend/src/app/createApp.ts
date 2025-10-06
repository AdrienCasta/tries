import { OnboardHelper } from "@features/onboard-helper/OnboardHelper.usecase.js";
import { HelperRepository } from "@shared/domain/repositories/HelperRepository.js";
import { HelperAccountRepository } from "@shared/domain/repositories/HelperAccountRepository.js";
import { ProfessionRepository } from "@shared/domain/repositories/ProfessionRepository.js";
import { OnboardedHelperNotificationService } from "@shared/domain/services/OnboardingHelperNotificationService.js";
import { Clock } from "@shared/domain/services/Clock.js";
import EventBus from "@shared/infrastructure/EventBus.js";
import OnboardHelperController from "@features/onboard-helper/OnboardHelper.controller.js";
import { registerHelperRoutes } from "@features/onboard-helper/OnboardHelper.routes.js";
import { HttpServer } from "@infrastructure/http/HttpServer.js";

export interface AppDependencies {
  helperRepository: HelperRepository;
  helperAccountRepository: HelperAccountRepository;
  professionRepository: ProfessionRepository;
  notificationService: OnboardedHelperNotificationService;
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
  // Create use cases
  const onboardHelper = new OnboardHelper(
    dependencies.helperRepository,
    dependencies.helperAccountRepository,
    dependencies.professionRepository,
    dependencies.notificationService,
    dependencies.clock
  );

  // Create controllers
  const onboardHelperController = new OnboardHelperController(
    onboardHelper,
    dependencies.eventBus,
    dependencies.clock
  );

  // Register routes
  registerHelperRoutes(server, onboardHelperController);

  return server;
}
