import { OnboardHelper } from "../../application/use-cases/OnboardHelper.js";
import { HelperRepository } from "../../domain/repositories/HelperRepository.js";
import { HelperAccountRepository } from "../../domain/repositories/HelperAccountRepository.js";
import { OnboardedHelperNotificationService } from "../../domain/services/OnboardingHelperNotificationService.js";
import { Clock } from "../../domain/services/Clock.js";
import EventBus from "../../domain/events/EventBus.js";
import OnboardHelperController from "../controllers/OnboardHelperController.js";
import { registerHelperRoutes } from "./routes/helperRoutes.js";
import { HttpServer } from "./HttpServer.js";

export interface AppDependencies {
  helperRepository: HelperRepository;
  helperAccountRepository: HelperAccountRepository;
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
