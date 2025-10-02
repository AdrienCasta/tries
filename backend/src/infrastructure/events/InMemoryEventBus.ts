import DomainEvent from "../../domain/events/DomainEvent.js";
import EventBus, { EventHandler } from "../../domain/events/EventBus.js";

export default class InMemoryEventBus implements EventBus {
  private handlers: Map<string, EventHandler<any>[]> = new Map();
  private publishedEvents: DomainEvent[] = [];

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    // Store the event for testing purposes
    this.publishedEvents.push(event);

    const eventHandlers = this.handlers.get(event.eventName) || [];

    for (const handler of eventHandlers) {
      await handler(event);
    }
  }

  subscribe<T extends DomainEvent>(
    eventName: string,
    handler: EventHandler<T>
  ): void {
    const handlers = this.handlers.get(eventName) || [];
    handlers.push(handler);
    this.handlers.set(eventName, handlers);
  }

  // Helper methods for testing
  getPublishedEvents(): DomainEvent[] {
    return [...this.publishedEvents];
  }

  getEventsByName<T extends DomainEvent>(eventName: string): T[] {
    return this.publishedEvents.filter(
      (event) => event.eventName === eventName
    ) as T[];
  }

  clearEvents(): void {
    this.publishedEvents = [];
  }
}
