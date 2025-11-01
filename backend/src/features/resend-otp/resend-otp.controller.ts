import ResendOtp from "./resend-otp.usecase";
import ResendOtpCommand from "./resend-otp.command";
import { Result } from "@shared/infrastructure/Result";

export interface ResendOtpRequest {
  email: string;
}

export interface ResendOtpSuccessResponse {
  message: string;
}

export interface ResendOtpErrorResponse {
  error: string;
  code?: string;
}

type ResendOtpControllerResponse =
  | { status: 200; body: ResendOtpSuccessResponse }
  | { status: 400 | 404; body: ResendOtpErrorResponse };

const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
} as const;

export default class ResendOtpController {
  constructor(private readonly resendOtpUseCase: ResendOtp) {}

  async handle(request: ResendOtpRequest): Promise<ResendOtpControllerResponse> {
    const command: ResendOtpCommand = {
      email: request.email,
    };

    const result = await this.resendOtpUseCase.execute(command);

    if (Result.isSuccess(result)) {
      return {
        status: HTTP_STATUS.OK,
        body: { message: "OTP sent successfully. Please check your inbox." },
      };
    }

    return this.handleFailure(result.error);
  }

  private handleFailure(error: Error): ResendOtpControllerResponse {
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
    if (error.name === "UserNotFoundError") {
      return HTTP_STATUS.NOT_FOUND;
    }
    return HTTP_STATUS.BAD_REQUEST;
  }
}
