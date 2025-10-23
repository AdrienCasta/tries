interface HelperRepository {
  findByEmail(email: string): any;
  update(email: string, updates: any): void;
}

export default class StartReview {
  constructor(private readonly helperRepository: HelperRepository) {}

  async execute(email: string): Promise<void> {
    this.helperRepository.update(email, { underReview: true });
  }
}
