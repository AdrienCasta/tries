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

  findByName(firstname: string, lastname: string): HelperForValidation | undefined {
    return this.helpers.find(
      (h) => h.firstname === firstname && h.lastname === lastname
    );
  }

  update(firstname: string, lastname: string, updates: Partial<HelperForValidation>): void {
    const helper = this.findByName(firstname, lastname);
    if (helper) {
      Object.assign(helper, updates);
    }
  }

  async updateProfileValidation(firstname: string, lastname: string, validated: boolean): Promise<void> {
    this.update(firstname, lastname, { profileValidated: validated });
  }

  isProfileValidated(firstname: string, lastname: string): boolean {
    const helper = this.findByName(firstname, lastname);
    return helper?.profileValidated ?? false;
  }
}
