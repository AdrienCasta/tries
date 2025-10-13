import type { OnboardHelperCommand } from "../../onboard-helper/OnboardHelper.types";

export interface OnboardHelperResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface IHelperRepository {
  onboard(data: OnboardHelperCommand): Promise<OnboardHelperResult>;
}
