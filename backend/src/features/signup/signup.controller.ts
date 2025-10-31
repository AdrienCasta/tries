import Signup, { EmailAlreadyInUseError } from "./signup.usecase";
import SignupCommand from "./signup.command";
import { Result } from "@shared/infrastructure/Result";

export interface SignupRequest {
  email: string;
  password: string;
}

export interface SignupSuccessResponse {
  message: string;
}

export interface SignupErrorResponse {
  error: string;
  code?: string;
  details?: any;
}

type SignupControllerResponse =
  | { status: 201; body: SignupSuccessResponse }
  | { status: 400 | 409; body: SignupErrorResponse };

const HTTP_STATUS = {
  CREATED: 201,
  BAD_REQUEST: 400,
  CONFLICT: 409,
} as const;

export default class SignupController {
  constructor(private readonly signupUseCase: Signup) {}

  async handle(request: SignupRequest): Promise<SignupControllerResponse> {
    const command = this.buildCommandFromRequest(request);
    const result = await this.signupUseCase.execute(command);

    if (Result.isSuccess(result)) {
      return this.handleSuccess();
    }

    return this.handleFailure(result.error);
  }

  private buildCommandFromRequest(request: SignupRequest): SignupCommand {
    return {
      email: request.email,
      password: request.password,
    };
  }

  private handleSuccess(): SignupControllerResponse {
    return {
      status: HTTP_STATUS.CREATED,
      body: {
        message: "User signed up successfully",
      },
    };
  }

  private handleFailure(error: Error): SignupControllerResponse {
    const status = this.mapErrorToStatus(error);
    return {
      status,
      body: this.createErrorResponse(error),
    };
  }

  private mapErrorToStatus(error: Error): 400 | 409 {
    if (this.isConflictError(error)) {
      return HTTP_STATUS.CONFLICT;
    }
    return HTTP_STATUS.BAD_REQUEST;
  }

  private isConflictError(error: Error): boolean {
    return error instanceof EmailAlreadyInUseError;
  }

  private createErrorResponse(error: Error): SignupErrorResponse {
    return {
      error: error.message,
      code: (error as any).name || (error as any).code,
      details: (error as any)?.details,
    };
  }
}
