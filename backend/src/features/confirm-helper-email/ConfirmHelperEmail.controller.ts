import { ConfirmHelperEmail } from "./ConfirmHelperEmail.usecase.js";
import { ConfirmHelperEmailCommand } from "./ConfirmHelperEmail.command.js";
import { Result } from "@shared/infrastructure/Result.js";
import {
  ConfirmHelperEmailRequest,
  ConfirmHelperEmailSuccessResponse,
  ConfirmHelperEmailErrorResponse,
} from "./ConfirmHelperEmail.dto.js";
import EventBus from "@shared/infrastructure/EventBus.js";
import {
  createHelperEmailConfirmationSucceeded,
  createHelperEmailConfirmationFailed,
} from "./ConfirmHelperEmail.events.js";
import { Clock } from "@shared/domain/services/Clock.js";

type ConfirmHelperEmailControllerResponse =
  | { status: 200; body: ConfirmHelperEmailSuccessResponse }
  | { status: 400; body: ConfirmHelperEmailErrorResponse };

export default class ConfirmHelperEmailController {
  constructor(
    private readonly confirmHelperEmailUseCase: ConfirmHelperEmail,
    private readonly eventBus: EventBus,
    private readonly clock: Clock
  ) {}

  async handle(
    request: ConfirmHelperEmailRequest
  ): Promise<ConfirmHelperEmailControllerResponse> {
    const command = new ConfirmHelperEmailCommand(request.token);

    const result = await this.confirmHelperEmailUseCase.execute(command);

    if (Result.isSuccess(result)) {
      await this.eventBus.publish(
        createHelperEmailConfirmationSucceeded(this.clock, request.token)
      );

      return {
        status: 200,
        body: {
          message: "Email confirmed successfully",
        },
      };
    }

    await this.eventBus.publish(
      createHelperEmailConfirmationFailed(
        this.clock,
        request.token,
        result.error
      )
    );

    return {
      status: 400,
      body: {
        error: result.error.message,
        code: result.error.code,
      },
    };
  }
}

export type ConfirmHelperEmailControllerResponseBody =
  ConfirmHelperEmailControllerResponse["body"];
