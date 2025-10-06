import { Clock } from "@shared/domain/services/Clock.js";

export class FixedClock implements Clock {
  constructor(private currentTime: Date = new Date("2025-01-01T12:00:00Z")) {}

  now(): Date {
    return new Date(this.currentTime.getTime());
  }

  setTime(time: Date): void {
    this.currentTime = time;
  }

  advance(milliseconds: number): void {
    this.currentTime = new Date(this.currentTime.getTime() + milliseconds);
  }

  advanceHours(hours: number): void {
    this.advance(hours * 60 * 60 * 1000);
  }
}
