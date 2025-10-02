import { User } from "../../domain/entities/User.js";
import { Helper } from "../../domain/entities/Helper.js";
import { HelperId } from "../../domain/value-objects/HelperId.js";
import { HelperRepository } from "../../domain/repositories/HelperRepository.js";
import { OnboardingHelperNotificationService } from "../../domain/services/OnboardingHelperNotificationService.js";

export class OnboardHelper {
  constructor(
    private readonly helperRepository: HelperRepository,
    private readonly onboardingHelperNotificationService: OnboardingHelperNotificationService
  ) {}

  async execute({ email, firstname, lastname }: User): Promise<void> {
    try {
      const helper: Helper = {
        id: HelperId.create(),
        email,
        firstname,
        lastname,
      };

      await this.helperRepository.save(helper);

      await this.onboardingHelperNotificationService.send(
        email,
        `Welcome ${firstname}! You have been successfully onboarded as a helper.`
      );
    } catch (error) {
      console.log(error);
    }
  }
}
