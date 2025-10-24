import { Result } from "@shared/infrastructure/Result";
import { HelperForValidation } from "@features/validation/domain/HelperForValidation";
import { ValidationHelperRepository } from "@features/validation/domain/ValidationHelperRepository";
import EventBus from "@shared/infrastructure/EventBus";
import { Clock } from "@shared/domain/services/Clock";
import { createHelperCredentialsUpdated } from "@features/invalidateHelperValidation/HelperCredentialsUpdated.event";
import InvalidateHelperValidation from "@features/invalidateHelperValidation/InvalidateHelperValidation.usecase";

export default class UpdateHelperProfile {
  constructor(
    private readonly helperRepository: ValidationHelperRepository,
    private readonly eventBus: EventBus,
    private readonly clock: Clock,
    private readonly invalidateHelperValidation: InvalidateHelperValidation
  ) {}

  async execute(
    email: string,
    updates: Partial<HelperForValidation>
  ): Promise<Result<void, Error>> {
    const credentialFieldsUpdated = this.hasCredentialFieldsUpdated(updates);

    if (credentialFieldsUpdated) {
      const invalidationResult = await this.invalidateHelperValidation.execute(email);
      if (Result.isFailure(invalidationResult)) {
        return invalidationResult;
      }
    }

    this.helperRepository.update(email, updates);

    if (credentialFieldsUpdated) {
      const event = createHelperCredentialsUpdated(this.clock, email);
      await this.eventBus.publish(event);
    }

    return Result.ok();
  }

  private hasCredentialFieldsUpdated(
    updates: Partial<HelperForValidation>
  ): boolean {
    const credentialFields: (keyof HelperForValidation)[] = [
      "credentialsSubmitted",
      "backgroundCheckSubmitted",
    ];

    return credentialFields.some((field) => field in updates);
  }
}
