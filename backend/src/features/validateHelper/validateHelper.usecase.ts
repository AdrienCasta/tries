interface ValidationHelperRepository {
  updateProfileValidation(firstname: string, lastname: string, validated: boolean): Promise<void>;
}

export default class ValidateHelper {
  constructor(private readonly helperRepository: ValidationHelperRepository) {}

  async execute(firstname: string, lastname: string): Promise<void> {
    await this.helperRepository.updateProfileValidation(firstname, lastname, true);
  }
}
