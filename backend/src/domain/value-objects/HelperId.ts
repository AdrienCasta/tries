import { Clock } from "../services/Clock.js";

export default class HelperId {
  readonly value: string;

  private constructor(value: string) {
    if (!value) {
      throw new Error("HelperId cannot be empty.");
    }
    this.value = value;
  }

  static create(clock: Clock): HelperId {
    return new HelperId(clock.now().toISOString());
  }

  toValue(): string {
    return this.value;
  }
}
