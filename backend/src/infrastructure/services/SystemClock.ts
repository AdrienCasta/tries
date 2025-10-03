import { Clock } from "../../domain/services/Clock.js";

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
