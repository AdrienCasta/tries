import { OnboardHelper } from "../../application/use-cases/OnboardHelper.js";
import { Result } from "../../shared/Result.js";
import { OnboardHelperRequest } from "../dto/OnboardHelperRequest.js";
import {
  OnboardHelperSuccessResponse,
  OnboardHelperErrorResponse,
} from "../dto/OnboardHelperResponse.js";
import EventBus from "../../domain/events/EventBus.js";
import { createHelperOnboardingFailed } from "../../domain/events/HelperOnboardingFailed.js";
import { createHelperOnboardingSucceeded } from "../../domain/events/HelperOnboardingSucceeded.js";

export default class OnboardHelperController {
  constructor(
    private readonly onboardHelperUseCase: OnboardHelper,
    private readonly eventBus: EventBus
  ) {}

  async handle(
    request: OnboardHelperRequest
  ): Promise<
    | { status: 201; body: OnboardHelperSuccessResponse }
    | { status: 400; body: OnboardHelperErrorResponse }
  > {
    const result = await this.onboardHelperUseCase.execute(request);

    if (Result.isSuccess(result)) {
      // Publish success event
      await this.eventBus.publish(
        createHelperOnboardingSucceeded(
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
        details: result.error.details,
      },
    };
  }
}
