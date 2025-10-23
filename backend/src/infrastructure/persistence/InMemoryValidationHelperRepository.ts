type HelperForValidation = {
  email: string;
  firstname?: string;
  lastname?: string;
  emailConfirmed: boolean;
  credentialsSubmitted: boolean;
  backgroundCheckSubmitted: boolean;
  profileValidated: boolean;
  rejected?: boolean;
  rejectionReason?: string;
  underReview?: boolean;
};

export class InMemoryValidationHelperRepository {
  private helpers: HelperForValidation[] = [];

  add(helper: HelperForValidation): void {
    this.helpers.push(helper);
  }

  async findAll(): Promise<HelperForValidation[]> {
    return this.helpers;
  }

  findByEmail(email: string): HelperForValidation | undefined {
    return this.helpers.find((h) => h.email === email);
  }

  update(email: string, updates: Partial<HelperForValidation>): void {
    const helper = this.findByEmail(email);
    if (helper) {
      Object.assign(helper, updates);
    }
  }

  isProfileValidated(email: string): boolean {
    const helper = this.findByEmail(email);
    return helper?.profileValidated ?? false;
  }

  isHelperRejected(email: string): boolean {
    const helper = this.findByEmail(email);
    return helper?.rejected ?? false;
  }
}
