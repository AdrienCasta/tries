type HelperForValidation = {
  firstname: string;
  lastname: string;
  emailConfirmed: boolean;
  credentialsSubmitted: boolean;
  backgroundCheckSubmitted: boolean;
  profileValidated: boolean;
};

interface ValidationHelperRepository {
  findAll(): Promise<HelperForValidation[]>;
}

export default class ManageHelperValidations {
  constructor(private readonly helperRepository: ValidationHelperRepository) {}

  async execute(): Promise<HelperForValidation[]> {
    const allHelpers = await this.helperRepository.findAll();
    return allHelpers.filter((helper) => this.isReadyForValidation(helper));
  }

  private isReadyForValidation(helper: HelperForValidation): boolean {
    return (
      helper.emailConfirmed &&
      helper.credentialsSubmitted &&
      helper.backgroundCheckSubmitted &&
      !helper.profileValidated
    );
  }
}
