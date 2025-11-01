import VerifyOtp from "./verify-otp.usecase";
import VerifyOtpCommand from "./verify-otp.command";
import { Result } from "@shared/infrastructure/Result";
import { OtpExpiredError } from "@shared/domain/repositories/AuthUserRepository";

export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
}

export interface VerifyOtpSuccessResponse {
  message: string;
}

export interface VerifyOtpErrorResponse {
  error: string;
  code?: string;
}

type VerifyOtpControllerResponse =
  | { status: 200; body: VerifyOtpSuccessResponse }
  | { status: 400 | 410; body: VerifyOtpErrorResponse };

const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  GONE: 410,
} as const;

export default class VerifyOtpController {
  constructor(private readonly verifyOtpUseCase: VerifyOtp) {}

  async handle(request: VerifyOtpRequest): Promise<VerifyOtpControllerResponse> {
    const command: VerifyOtpCommand = {
      email: request.email,
      otpCode: request.otpCode,
    };

    const result = await this.verifyOtpUseCase.execute(command);

    if (Result.isSuccess(result)) {
      return {
        status: HTTP_STATUS.OK,
        body: { message: "Email verified successfully" },
      };
    }

    return this.handleFailure(result.error);
  }

  private handleFailure(error: Error): VerifyOtpControllerResponse {
    const status = this.mapErrorToStatus(error);
    return {
      status,
      body: {
        error: error.message,
        code: error.name,
      },
    };
  }

  private mapErrorToStatus(error: Error): 400 | 410 {
    if (error instanceof OtpExpiredError) {
      return HTTP_STATUS.GONE;
    }
    return HTTP_STATUS.BAD_REQUEST;
  }
}
