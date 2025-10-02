import DomainEvent from "./DomainEvent.js";

export type EventHandler<T extends DomainEvent> = (event: T) => void | Promise<void>;

export default interface EventBus {
  publish<T extends DomainEvent>(event: T): Promise<void>;
  subscribe<T extends DomainEvent>(eventName: string, handler: EventHandler<T>): void;
}
