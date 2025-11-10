import UpdateProfile from "./update-profile.usecase";
import UpdateProfileCommand from "./update-profile.command";
import { Result } from "@shared/infrastructure/Result";

export interface UpdateProfileRequest {
  userId: string;
  firstname: string;
  lastname: string;
}

export interface UpdateProfileSuccessResponse {
  message: string;
}

export interface UpdateProfileErrorResponse {
  error: string;
  code?: string;
}

type UpdateProfileControllerResponse =
  | { status: 200; body: UpdateProfileSuccessResponse }
  | { status: 400 | 404; body: UpdateProfileErrorResponse };

const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
} as const;

export default class UpdateProfileController {
  constructor(private readonly updateProfileUseCase: UpdateProfile) {}

  async handle(request: UpdateProfileRequest): Promise<UpdateProfileControllerResponse> {
    const command: UpdateProfileCommand = {
      userId: request.userId,
      firstname: request.firstname,
      lastname: request.lastname,
    };

    const result = await this.updateProfileUseCase.execute(command);

    if (Result.isSuccess(result)) {
      return {
        status: HTTP_STATUS.OK,
        body: {
          message: "Profile updated successfully",
        },
      };
    }

    return this.handleFailure(result.error);
  }

  private handleFailure(error: Error): UpdateProfileControllerResponse {
    if (error.message.includes("not found")) {
      return {
        status: HTTP_STATUS.NOT_FOUND,
        body: {
          error: error.message,
          code: error.name,
        },
      };
    }

    return {
      status: HTTP_STATUS.BAD_REQUEST,
      body: {
        error: error.message,
        code: error.name,
      },
    };
  }
}
