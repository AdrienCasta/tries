interface ValidationHelperRepository {
  update(firstname: string, lastname: string, updates: any): void;
}

export default class RejectHelper {
  constructor(private readonly helperRepository: ValidationHelperRepository) {}

  async execute(firstname: string, lastname: string): Promise<void> {
    this.helperRepository.update(firstname, lastname, { rejected: true });
  }
}
