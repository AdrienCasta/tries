import { OnboardHelper } from "./OnboardHelper.usecase.js";
import { OnboardHelperCommand } from "./OnboardHelper.command.js";
import { Result } from "@shared/infrastructure/Result.js";
import {
  OnboardHelperRequest,
  OnboardHelperSuccessResponse,
  OnboardHelperErrorResponse,
} from "./OnboardHelper.dto.js";
import EventBus from "@shared/infrastructure/EventBus.js";
import {
  createHelperOnboardingFailed,
  createHelperOnboardingSucceeded,
} from "./OnboardHelper.events.js";
import { Clock } from "@shared/domain/services/Clock.js";

type OnboardHelperControllerResponse =
  | { status: 201; body: OnboardHelperSuccessResponse }
  | { status: 400; body: OnboardHelperErrorResponse };

export default class OnboardHelperController {
  constructor(
    private readonly onboardHelperUseCase: OnboardHelper,
    private readonly eventBus: EventBus,
    private readonly clock: Clock
  ) {}

  async handle(
    request: OnboardHelperRequest
  ): Promise<OnboardHelperControllerResponse> {
    const command = new OnboardHelperCommand(
      request.email,
      request.firstname,
      request.lastname,
      request.professions,
      new Date(request.birthdate),
      request.phoneNumber,
      request.frenchCounty
    );

    const result = await this.onboardHelperUseCase.execute(command);

    if (Result.isSuccess(result)) {
      await this.eventBus.publish(
        createHelperOnboardingSucceeded(
          this.clock,
          result.value,
          request.email,
          request.firstname,
          request.lastname
        )
      );

      return {
        status: 201,
        body: {
          helperId: result.value.value,
          message: "Helper successfully onboarded",
        },
      };
    }

    // Publish failure event
    await this.eventBus.publish(
      createHelperOnboardingFailed(
        this.clock,
        request.email,
        request.firstname,
        request.lastname,
        result.error
      )
    );

    // Validation failure response
    return {
      status: 400,
      body: {
        error: result.error.message,
        code: result.error.code,
        details: result.error?.details,
      },
    };
  }
}

export type OnboardHelperControllerResponseBody =
  OnboardHelperControllerResponse["body"];
