import Login from "./login.usecase";
import LoginCommand from "./login.command";
import { Result } from "@shared/infrastructure/Result";
import { UserNotFoundError } from "@shared/domain/services/AuthService";

export interface LoginRequest {
  email: string;
}

export interface LoginSuccessResponse {
  message: string;
}

export interface LoginErrorResponse {
  error: string;
  code?: string;
}

type LoginControllerResponse =
  | { status: 200; body: LoginSuccessResponse }
  | { status: 400 | 404; body: LoginErrorResponse };

const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
} as const;

export default class LoginController {
  constructor(private readonly loginUseCase: Login) {}

  async handle(request: LoginRequest): Promise<LoginControllerResponse> {
    const command: LoginCommand = {
      email: request.email,
    };

    const result = await this.loginUseCase.execute(command);

    if (Result.isSuccess(result)) {
      return {
        status: HTTP_STATUS.OK,
        body: { message: "OTP sent successfully" },
      };
    }

    return this.handleFailure(result.error);
  }

  private handleFailure(error: Error): LoginControllerResponse {
    const status = this.mapErrorToStatus(error);
    return {
      status,
      body: {
        error: error.message,
        code: error.name,
      },
    };
  }

  private mapErrorToStatus(error: Error): 400 | 404 {
    if (error instanceof UserNotFoundError) {
      return HTTP_STATUS.NOT_FOUND;
    }
    return HTTP_STATUS.BAD_REQUEST;
  }
}
