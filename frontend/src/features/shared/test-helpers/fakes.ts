import type { IHelperRepository, OnboardHelperResult } from "../api/types";
import type { OnboardHelperCommand } from "../../register-helper/RegisterHelper.types";

export class FakeSuccessRepository implements IHelperRepository {
  async onboard(_data: OnboardHelperCommand): Promise<OnboardHelperResult> {
    return {
      success: true,
      message: "Helper onboarded successfully",
    };
  }
}

export class FakeFailureRepository implements IHelperRepository {
  async onboard(_data: OnboardHelperCommand): Promise<OnboardHelperResult> {
    return {
      success: false,
      error: "Failed to onboard helper",
    };
  }
}

export class FakeSlowRepository implements IHelperRepository {
  async onboard(_data: OnboardHelperCommand): Promise<OnboardHelperResult> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      success: true,
      message: "Helper onboarded successfully",
    };
  }
}
