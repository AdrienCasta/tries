import EventBus, { EventHandler } from "../../domain/events/EventBus.js";
import DomainEvent from "../../domain/events/DomainEvent.js";

export class InMemoryEventBus implements EventBus {
  private handlers: Map<string, EventHandler<any>[]> = new Map();
  private publishedEvents: DomainEvent[] = [];

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    this.publishedEvents.push(event);

    const handlers = this.handlers.get(event.eventName) || [];
    for (const handler of handlers) {
      await handler(event);
    }
  }

  subscribe<T extends DomainEvent>(
    eventName: string,
    handler: EventHandler<T>
  ): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  getPublishedEvents(): DomainEvent[] {
    return [...this.publishedEvents];
  }

  clear(): void {
    this.publishedEvents = [];
  }
}
