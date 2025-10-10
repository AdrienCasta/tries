import { OnboardHelper } from "./OnboardHelper.usecase.js";
import { OnboardHelperCommand } from "./OnboardHelper.command.js";
import { Result, Failure } from "@shared/infrastructure/Result.js";
import EmailAlreadyUsedError from "@shared/infrastructure/EmailAlreadyUsedError.js";
import PhoneAlreadyUsedError from "@shared/infrastructure/PhoneAlreadyUsedError.js";
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
import HelperId from "@shared/domain/value-objects/HelperId.js";

type OnboardHelperControllerResponse =
  | { status: 201; body: OnboardHelperSuccessResponse }
  | { status: 400 | 409; body: OnboardHelperErrorResponse };

const HTTP_STATUS = {
  CREATED: 201,
  BAD_REQUEST: 400,
  CONFLICT: 409,
} as const;

export default class OnboardHelperController {
  constructor(
    private readonly onboardHelperUseCase: OnboardHelper,
    private readonly eventBus: EventBus,
    private readonly clock: Clock
  ) {}

  async handle(
    request: OnboardHelperRequest
  ): Promise<OnboardHelperControllerResponse> {
    const command = this.buildCommandFromRequest(request);
    const result = await this.onboardHelperUseCase.execute(command);

    if (Result.isSuccess(result)) {
      return await this.handleSuccess(result.value, request);
    }

    return await this.handleFailure(result, request);
  }

  private buildCommandFromRequest(
    request: OnboardHelperRequest
  ): OnboardHelperCommand {
    return new OnboardHelperCommand(
      request.email,
      request.firstname,
      request.lastname,
      request.professions,
      new Date(request.birthdate),
      request.phoneNumber,
      request.frenchCounty
    );
  }

  private async handleSuccess(
    helperId: HelperId,
    request: OnboardHelperRequest
  ): Promise<OnboardHelperControllerResponse> {
    await this.eventBus.publish(
      createHelperOnboardingSucceeded(
        this.clock,
        helperId,
        request.email,
        request.firstname,
        request.lastname
      )
    );

    return {
      status: HTTP_STATUS.CREATED,
      body: {
        helperId: helperId.value,
        message: "Helper successfully onboarded",
      },
    };
  }

  private async handleFailure(
    result: Failure<Error>,
    request: OnboardHelperRequest
  ): Promise<OnboardHelperControllerResponse> {
    await this.eventBus.publish(
      createHelperOnboardingFailed(
        this.clock,
        request.email,
        request.firstname,
        request.lastname,
        result.error
      )
    );

    const status = this.mapErrorToStatus(result.error);
    return {
      status,
      body: this.createErrorResponse(result.error),
    };
  }

  private mapErrorToStatus(error: Error): 400 | 409 {
    if (this.isConflictError(error)) {
      return HTTP_STATUS.CONFLICT;
    }
    return HTTP_STATUS.BAD_REQUEST;
  }

  private isConflictError(error: Error): boolean {
    return (
      error instanceof PhoneAlreadyUsedError ||
      error instanceof EmailAlreadyUsedError
    );
  }

  private createErrorResponse(error: Error): OnboardHelperErrorResponse {
    return {
      error: error.message,
      code: (error as any).code,
      details: (error as any)?.details,
    };
  }
}

export type OnboardHelperControllerResponseBody =
  OnboardHelperControllerResponse["body"];
