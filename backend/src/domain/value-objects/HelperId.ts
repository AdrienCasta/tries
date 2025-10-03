import { randomUUID } from "crypto";

export default class HelperId {
  readonly value: string;

  private constructor(value: string) {
    if (!value) {
      throw new Error("HelperId cannot be empty.");
    }
    this.value = value;
  }

  static generate(): HelperId {
    return new HelperId(randomUUID());
  }

  static create(id: string): HelperId {
    return new HelperId(id);
  }

  toValue(): string {
    return this.value;
  }
}
