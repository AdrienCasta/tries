import RegisterHelper from "./registerHelper.usecase";
import RegisterHelperCommand from "./registerHelper.command";
import { Result } from "@shared/infrastructure/Result";

export interface RegisterHelperRequest {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  birthdate: string;
  placeOfBirth: {
    country: string;
    city: string;
  };
  professions: Array<{
    code: string;
    healthId: { rpps: string } | { adeli: string };
    credential?: { fileType: string; fileSize: number };
  }>;
  residence: {
    country: string;
    frenchAreaCode?: string;
  };
  criminalRecordCertificate?: { fileType: string; fileSize: number };
}

export interface RegisterHelperSuccessResponse {
  message: string;
}

export interface RegisterHelperErrorResponse {
  error: string;
  code?: string;
  details?: any;
}

type RegisterHelperControllerResponse =
  | { status: 201; body: RegisterHelperSuccessResponse }
  | { status: 400 | 409; body: RegisterHelperErrorResponse };

const HTTP_STATUS = {
  CREATED: 201,
  BAD_REQUEST: 400,
  CONFLICT: 409,
} as const;

export default class RegisterHelperController {
  constructor(private readonly registerHelperUseCase: RegisterHelper) {}

  async handle(
    request: RegisterHelperRequest
  ): Promise<RegisterHelperControllerResponse> {
    const command = this.buildCommandFromRequest(request);
    const result = await this.registerHelperUseCase.execute(command);

    if (Result.isSuccess(result)) {
      return this.handleSuccess();
    }

    return this.handleFailure(result.error);
  }

  private buildCommandFromRequest(
    request: RegisterHelperRequest
  ): RegisterHelperCommand {
    return {
      email: request.email,
      password: request.password,
      firstname: request.firstname,
      lastname: request.lastname,
      phoneNumber: request.phoneNumber,
      birthdate: new Date(request.birthdate),
      placeOfBirth: request.placeOfBirth,
      professions: request.professions,
      residence: request.residence,
      criminalRecordCertificate: request.criminalRecordCertificate,
    };
  }

  private handleSuccess(): RegisterHelperControllerResponse {
    return {
      status: HTTP_STATUS.CREATED,
      body: {
        message: "Helper registered successfully",
      },
    };
  }

  private handleFailure(error: Error): RegisterHelperControllerResponse {
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
    const errorName = error.constructor.name;
    return (
      errorName === "EmailAlreadyInUseError" ||
      errorName === "PhoneAlreadyInUseError"
    );
  }

  private createErrorResponse(error: Error): RegisterHelperErrorResponse {
    return {
      error: error.message,
      code: (error as any).name || (error as any).code,
      details: (error as any)?.details,
    };
  }
}
