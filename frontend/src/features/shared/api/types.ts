import type { OnboardHelperCommand } from "../../register-helper/RegisterHelper.types";

export interface OnboardHelperResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface IHelperRepository {
  onboard(data: OnboardHelperCommand): Promise<OnboardHelperResult>;
}
