export class HelperId {
  readonly value: string;

  private constructor(value: string) {
    if (!value) {
      throw new Error("HelperId cannot be empty.");
    }
    this.value = value;
  }

  static create(): HelperId {
    return new HelperId(new Date().toISOString());
  }

  toValue(): string {
    return this.value;
  }
}
