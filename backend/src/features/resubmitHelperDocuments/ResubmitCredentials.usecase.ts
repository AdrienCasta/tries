interface HelperRepository {
  findByName(firstname: string, lastname: string): any;
  update(firstname: string, lastname: string, updates: any): void;
}

export default class ResubmitCredentials {
  constructor(private readonly helperRepository: HelperRepository) {}

  async execute(firstname: string, lastname: string): Promise<void> {
    const helper = this.helperRepository.findByName(firstname, lastname);

    if (helper?.profileValidated) {
      this.helperRepository.update(firstname, lastname, { profileValidated: false });
    }
  }
}
