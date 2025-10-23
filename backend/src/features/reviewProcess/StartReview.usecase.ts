interface HelperRepository {
  findByName(firstname: string, lastname: string): any;
  update(firstname: string, lastname: string, updates: any): void;
}

export default class StartReview {
  constructor(private readonly helperRepository: HelperRepository) {}

  async execute(firstname: string, lastname: string): Promise<void> {
    this.helperRepository.update(firstname, lastname, { underReview: true });
  }
}
