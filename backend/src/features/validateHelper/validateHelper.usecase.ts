interface ValidationHelperRepository {
  findByName(firstname: string, lastname: string): any;
  update(firstname: string, lastname: string, updates: any): void;
}

export default class ValidateHelper {
  constructor(private readonly helperRepository: ValidationHelperRepository) {}

  async execute(firstname: string, lastname: string): Promise<void> {
    const helper = this.helperRepository.findByName(firstname, lastname);

    if (!helper) {
      throw new Error("Helper not found");
    }

    if (!helper.credentialsSubmitted) {
      throw new Error("Cannot validate without credentials");
    }

    if (!helper.backgroundCheckSubmitted) {
      throw new Error("Cannot validate without background screening");
    }

    this.helperRepository.update(firstname, lastname, { profileValidated: true });
  }
}
