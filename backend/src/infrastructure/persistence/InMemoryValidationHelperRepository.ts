type HelperForValidation = {
  firstname: string;
  lastname: string;
  emailConfirmed: boolean;
  credentialsSubmitted: boolean;
  backgroundCheckSubmitted: boolean;
  profileValidated: boolean;
};

export class InMemoryValidationHelperRepository {
  private helpers: HelperForValidation[] = [];

  add(helper: HelperForValidation): void {
    this.helpers.push(helper);
  }

  async findAll(): Promise<HelperForValidation[]> {
    return this.helpers;
  }
}
