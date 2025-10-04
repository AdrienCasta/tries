export default interface DomainEvent {
  readonly occurredAt: Date;
  readonly eventName: string;
}
