# Claude Project Guide

## Project Overview

This project uses **Node.js** with **TypeScript**, following **Object-Oriented Programming (OOP)** principles, **Clean Architecture**, **SOLID principles**, and **Clean Code** practices.

## Development Methodology

This project follows:

- **TDD (Test-Driven Development)**: Write tests before implementation
- **DDD (Domain-Driven Design)**: Focus on domain models and ubiquitous language
- **BDD (Behavior-Driven Development)**: Acceptance tests written using **Gherkin syntax**

---

## Architecture Principles

### Clean Architecture Layers

Follow the dependency rule: dependencies point inward, never outward.

```
┌─────────────────────────────────────┐
│     Frameworks & Drivers            │  ← Infrastructure
├─────────────────────────────────────┤
│     Interface Adapters              │  ← Controllers, Presenters, Gateways
├─────────────────────────────────────┤
│     Application Business Rules      │  ← Use Cases
├─────────────────────────────────────┤
│     Enterprise Business Rules       │  ← Entities, Domain Models
└─────────────────────────────────────┘
```

**Layer Responsibilities:**

- **Entities (Domain)**: Core business logic, domain models, value objects
- **Use Cases (Application)**: Application-specific business rules, orchestrates entities
- **Interface Adapters**: Controllers, presenters, repositories implementations
- **Frameworks & Drivers**: External frameworks, databases, web servers

---

## SOLID Principles

### S - Single Responsibility Principle

Each class should have one reason to change.

```typescript
class UserRepository {
  async save(user: User): Promise<Result<void, DatabaseError>> {}
}

class UserValidator {
  validate(user: User): Result<User, ValidationError> {}
}
```

### O - Open/Closed Principle

Open for extension, closed for modification.

```typescript
interface PaymentStrategy {
  process(amount: number): Promise<Result<PaymentReceipt, PaymentError>>;
}

class CreditCardPayment implements PaymentStrategy {
  async process(
    amount: number
  ): Promise<Result<PaymentReceipt, PaymentError>> {}
}
```

### L - Liskov Substitution Principle

Subtypes must be substitutable for their base types.

### I - Interface Segregation Principle

No client should depend on methods it doesn't use.

```typescript
interface Readable {
  read(): Result<string, ReadError>;
}

interface Writable {
  write(data: string): Result<void, WriteError>;
}
```

### D - Dependency Inversion Principle

Depend on abstractions, not concretions.

```typescript
class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}
}
```

---

## Code Structure

### Project Structure

```
src/
├── domain/
│   ├── entities/              # Rich domain models with behavior
│   ├── value-objects/         # Immutable values (Email, Money, etc.)
│   ├── aggregates/            # Aggregate roots
│   ├── domain-events/         # Domain events
│   ├── domain-services/       # Domain logic that doesn't fit in entities
│   └── repositories/          # Repository interfaces
├── application/
│   ├── use-cases/
│   ├── dtos/
│   ├── event-handlers/        # Application event handlers
│   └── ports/                 # Interfaces for external services
├── infrastructure/
│   ├── repositories/          # Repository implementations
│   ├── database/
│   ├── http/
│   └── external-services/
└── presentation/
    ├── controllers/
    └── middlewares/
tests/
├── unit/                      # TDD unit tests
├── integration/               # Integration tests
└── acceptance/                # BDD Gherkin scenarios
    ├── features/
    └── step-definitions/
```

### Naming Conventions

- **Classes**: PascalCase (`UserRepository`, `CreateUserUseCase`)
- **Interfaces**: PascalCase with `I` prefix (`IUserRepository`) or descriptive names
- **Methods/Functions**: camelCase (`createUser`, `validateEmail`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- **Files**: kebab-case (`user-repository.ts`, `create-user-use-case.ts`)

---

## Clean Code Practices

### Functions

- Keep functions small (< 20 lines ideally)
- One level of abstraction per function
- Descriptive names that explain intent
- Maximum 3 parameters (use objects for more)

```typescript
async function createUser(
  params: CreateUserParams
): Promise<Result<User, ValidationError>> {
  const validatedData = this.validateUserData(params);
  if (validatedData.isFailure) {
    return failure(validatedData.error);
  }

  const user = this.buildUser(validatedData.value);
  return await this.userRepository.save(user);
}
```

### Classes

- Small and focused
- Single responsibility
- Organize from high to low level (public methods first)
- Use dependency injection
- No comments, write self-documenting code

---

## TypeScript Best Practices

### Type Safety

```typescript
interface User {
  id: string;
  email: string;
  name: string;
}

type Result<T, E = Error> = Success<T> | Failure<E>;
```

### Error Handling - Result Pattern

```typescript
type Result<T, E = Error> = Success<T> | Failure<E>;

class Success<T> {
  readonly isSuccess = true;
  readonly isFailure = false;

  constructor(readonly value: T) {}
}

class Failure<E> {
  readonly isSuccess = false;
  readonly isFailure = true;

  constructor(readonly error: E) {}
}

function success<T>(value: T): Success<T> {
  return new Success(value);
}

function failure<E>(error: E): Failure<E> {
  return new Failure(error);
}

class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User with id ${userId} not found`);
    this.name = "UserNotFoundError";
  }
}

async function findUser(id: string): Promise<Result<User, UserNotFoundError>> {
  const user = await userRepository.findById(id);

  if (!user) {
    return failure(new UserNotFoundError(id));
  }

  return success(user);
}

const result = await findUser("123");

if (result.isFailure) {
  console.error(result.error.message);
  return;
}

const user = result.value;
```

### Async/Await

Always prefer async/await over promises for readability.

---

## Domain-Driven Design (DDD)

### Ubiquitous Language

Use the same terminology in code, documentation, and conversations with domain experts. Every concept in the domain should have a clear name that everyone understands.

### Building Blocks

#### Entities

Objects with unique identity that persists over time.

```typescript
class User {
  private constructor(
    private readonly id: UserId,
    private name: UserName,
    private email: Email,
    private status: UserStatus
  ) {}

  static create(name: string, email: string): Result<User, ValidationError> {
    const userNameResult = UserName.create(name);
    if (userNameResult.isFailure) return failure(userNameResult.error);

    const emailResult = Email.create(email);
    if (emailResult.isFailure) return failure(emailResult.error);

    return success(
      new User(
        UserId.generate(),
        userNameResult.value,
        emailResult.value,
        UserStatus.ACTIVE
      )
    );
  }

  activate(): Result<void, DomainError> {
    if (this.status === UserStatus.ACTIVE) {
      return failure(new DomainError("User is already active"));
    }
    this.status = UserStatus.ACTIVE;
    return success(undefined);
  }

  deactivate(): void {
    this.status = UserStatus.INACTIVE;
  }

  changeName(newName: UserName): void {
    this.name = newName;
  }

  getId(): UserId {
    return this.id;
  }

  getEmail(): Email {
    return this.email;
  }
}
```

#### Value Objects

Immutable objects without identity, defined by their attributes.

```typescript
class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Result<Email, ValidationError> {
    if (!email || !email.includes("@")) {
      return failure(new ValidationError("Invalid email format"));
    }
    return success(new Email(email.toLowerCase()));
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: Currency
  ) {}

  static create(
    amount: number,
    currency: Currency
  ): Result<Money, ValidationError> {
    if (amount < 0) {
      return failure(new ValidationError("Amount cannot be negative"));
    }
    return success(new Money(amount, currency));
  }

  add(other: Money): Result<Money, DomainError> {
    if (!this.currency.equals(other.currency)) {
      return failure(
        new DomainError("Cannot add money with different currencies")
      );
    }
    return success(new Money(this.amount + other.amount, this.currency));
  }

  getAmount(): number {
    return this.amount;
  }
}
```

#### Aggregates

Cluster of entities and value objects with a root entity that ensures consistency.

```typescript
class Order {
  private constructor(
    private readonly id: OrderId,
    private customerId: CustomerId,
    private items: OrderItem[],
    private status: OrderStatus,
    private total: Money
  ) {}

  static create(customerId: CustomerId): Order {
    return new Order(
      OrderId.generate(),
      customerId,
      [],
      OrderStatus.DRAFT,
      Money.zero()
    );
  }

  addItem(product: Product, quantity: number): Result<void, DomainError> {
    if (this.status !== OrderStatus.DRAFT) {
      return failure(new DomainError("Cannot add items to a non-draft order"));
    }

    if (quantity <= 0) {
      return failure(new DomainError("Quantity must be positive"));
    }

    const item = OrderItem.create(product, quantity);
    this.items.push(item);
    this.recalculateTotal();

    return success(undefined);
  }

  removeItem(productId: ProductId): Result<void, DomainError> {
    if (this.status !== OrderStatus.DRAFT) {
      return failure(
        new DomainError("Cannot remove items from a non-draft order")
      );
    }

    this.items = this.items.filter(
      (item) => !item.getProductId().equals(productId)
    );
    this.recalculateTotal();

    return success(undefined);
  }

  submit(): Result<void, DomainError> {
    if (this.items.length === 0) {
      return failure(new DomainError("Cannot submit an empty order"));
    }

    if (this.status !== OrderStatus.DRAFT) {
      return failure(new DomainError("Order is already submitted"));
    }

    this.status = OrderStatus.SUBMITTED;
    return success(undefined);
  }

  private recalculateTotal(): void {
    this.total = this.items.reduce(
      (acc, item) => acc.add(item.getSubtotal()).value,
      Money.zero()
    );
  }

  getTotal(): Money {
    return this.total;
  }
}
```

#### Domain Events

Record something that happened in the domain.

```typescript
interface DomainEvent {
  occurredOn: Date;
  aggregateId: string;
}

class UserRegisteredEvent implements DomainEvent {
  readonly occurredOn: Date;

  constructor(
    readonly aggregateId: string,
    readonly userId: string,
    readonly email: string,
    readonly name: string
  ) {
    this.occurredOn = new Date();
  }
}

class OrderSubmittedEvent implements DomainEvent {
  readonly occurredOn: Date;

  constructor(
    readonly aggregateId: string,
    readonly orderId: string,
    readonly customerId: string,
    readonly total: number
  ) {
    this.occurredOn = new Date();
  }
}
```

#### Domain Services

Operations that don't naturally fit within an entity or value object.

```typescript
class TransferMoneyService {
  constructor(private accountRepository: IAccountRepository) {}

  async transfer(
    fromAccountId: AccountId,
    toAccountId: AccountId,
    amount: Money
  ): Promise<Result<void, DomainError>> {
    const fromAccountResult = await this.accountRepository.findById(
      fromAccountId
    );
    if (fromAccountResult.isFailure) return failure(fromAccountResult.error);

    const toAccountResult = await this.accountRepository.findById(toAccountId);
    if (toAccountResult.isFailure) return failure(toAccountResult.error);

    const fromAccount = fromAccountResult.value;
    const toAccount = toAccountResult.value;

    const withdrawResult = fromAccount.withdraw(amount);
    if (withdrawResult.isFailure) return failure(withdrawResult.error);

    toAccount.deposit(amount);

    await this.accountRepository.save(fromAccount);
    await this.accountRepository.save(toAccount);

    return success(undefined);
  }
}
```

#### Repositories (DDD Style)

Collections of aggregates with persistence abstraction.

```typescript
interface IOrderRepository {
  findById(id: OrderId): Promise<Result<Order, OrderNotFoundError>>;
  findByCustomerId(
    customerId: CustomerId
  ): Promise<Result<Order[], RepositoryError>>;
  save(order: Order): Promise<Result<void, RepositoryError>>;
  delete(id: OrderId): Promise<Result<void, RepositoryError>>;
  nextIdentity(): OrderId;
}
```

### Bounded Contexts

Divide the system into bounded contexts where each has its own ubiquitous language and models.

```
┌─────────────────────────────────────────────┐
│         Sales Context                       │
│  - Order, Customer, Product                 │
│  - Order = sales transaction                │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│         Shipping Context                    │
│  - Shipment, Package, Address               │
│  - Order = items to be shipped              │
└─────────────────────────────────────────────┘
```

---

## Test-Driven Development (TDD)

### Red-Green-Refactor Cycle

1. **Red**: Write a failing test
2. **Green**: Write minimal code to make it pass
3. **Refactor**: Improve code while keeping tests green

### TDD Workflow

```typescript
describe("Email Value Object", () => {
  describe("create", () => {
    it("should create valid email", () => {
      const result = Email.create("user@example.com");

      expect(result.isSuccess).toBe(true);
      expect(result.value.getValue()).toBe("user@example.com");
    });

    it("should fail when email is empty", () => {
      const result = Email.create("");

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(ValidationError);
    });

    it("should fail when email has no @ symbol", () => {
      const result = Email.create("invalid-email");

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toContain("Invalid email format");
    });

    it("should normalize email to lowercase", () => {
      const result = Email.create("USER@EXAMPLE.COM");

      expect(result.isSuccess).toBe(true);
      expect(result.value.getValue()).toBe("user@example.com");
    });
  });

  describe("equals", () => {
    it("should return true for same email values", () => {
      const email1 = Email.create("user@example.com").value;
      const email2 = Email.create("user@example.com").value;

      expect(email1.equals(email2)).toBe(true);
    });

    it("should return false for different email values", () => {
      const email1 = Email.create("user1@example.com").value;
      const email2 = Email.create("user2@example.com").value;

      expect(email1.equals(email2)).toBe(false);
    });
  });
});
```

### Unit Test Best Practices

```typescript
describe("Order Aggregate", () => {
  let order: Order;
  let product: Product;

  beforeEach(() => {
    order = Order.create(new CustomerId("customer-123"));
    product = Product.create(
      "Product Name",
      Money.create(100, Currency.USD).value
    );
  });

  describe("addItem", () => {
    it("should add item to draft order", () => {
      const result = order.addItem(product, 2);

      expect(result.isSuccess).toBe(true);
      expect(order.getTotal().getAmount()).toBe(200);
    });

    it("should fail when adding item to submitted order", () => {
      order.addItem(product, 1);
      order.submit();

      const result = order.addItem(product, 1);

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toContain(
        "Cannot add items to a non-draft order"
      );
    });

    it("should fail when quantity is zero", () => {
      const result = order.addItem(product, 0);

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toContain("Quantity must be positive");
    });

    it("should fail when quantity is negative", () => {
      const result = order.addItem(product, -1);

      expect(result.isFailure).toBe(true);
    });

    it("should recalculate total when adding items", () => {
      const product1 = Product.create(
        "Product 1",
        Money.create(100, Currency.USD).value
      );
      const product2 = Product.create(
        "Product 2",
        Money.create(50, Currency.USD).value
      );

      order.addItem(product1, 2);
      order.addItem(product2, 3);

      expect(order.getTotal().getAmount()).toBe(350);
    });
  });

  describe("submit", () => {
    it("should submit order with items", () => {
      order.addItem(product, 1);

      const result = order.submit();

      expect(result.isSuccess).toBe(true);
    });

    it("should fail when submitting empty order", () => {
      const result = order.submit();

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toContain("Cannot submit an empty order");
    });

    it("should fail when order is already submitted", () => {
      order.addItem(product, 1);
      order.submit();

      const result = order.submit();

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toContain("Order is already submitted");
    });
  });
});
```

### Test Structure

- **Arrange**: Set up test data and preconditions
- **Act**: Execute the behavior being tested
- **Assert**: Verify the outcome

### Testing Guidelines

- One assertion concept per test
- Test behavior, not implementation
- Use descriptive test names that explain the scenario
- Test edge cases and error conditions
- Keep tests independent and isolated
- Use test doubles (mocks, stubs) for dependencies

---

## Behavior-Driven Development (BDD)

### Acceptance Tests Structure

```gherkin
Feature: User Registration
  As a new user
  I want to register an account
  So that I can access the platform

  Background:
    Given the system is ready
    And the database is clean

  Scenario: Successful user registration
    Given I am on the registration page
    When I fill in the registration form with valid data
      | field    | value              |
      | name     | John Doe           |
      | email    | john@example.com   |
      | password | SecurePass123!     |
    And I submit the form
    Then I should see a success message
    And a new user should be created in the database
    And a confirmation email should be sent

  Scenario: Registration with existing email
    Given a user exists with email "john@example.com"
    When I try to register with email "john@example.com"
    Then I should see an error message "Email already registered"
    And no new user should be created
```

### Gherkin Best Practices

- **One scenario = one behavior**
- Use **Given** for context/preconditions
- Use **When** for actions
- Use **Then** for expected outcomes
- Keep scenarios independent
- Use descriptive feature names
- Avoid technical details in scenarios (focus on business language)

### Step Implementation

```typescript
import { Given, When, Then } from "@cucumber/cucumber";

Given("I am on the registration page", async function () {
  this.page = "/register";
});

When(
  "I fill in the registration form with valid data",
  async function (dataTable) {
    const data = dataTable.rowsHash();
    this.registrationData = data;
  }
);

Then("a new user should be created in the database", async function () {
  const user = await this.userRepository.findByEmail(
    this.registrationData.email
  );
  expect(user).toBeDefined();
});
```

---

## Code Review Checklist

When reviewing or writing code, ensure:

- [ ] Follows clean architecture layers
- [ ] Respects SOLID principles
- [ ] Rich domain models with behavior (DDD)
- [ ] Value objects are immutable
- [ ] Aggregates maintain consistency boundaries
- [ ] Uses ubiquitous language from domain
- [ ] Tests written before implementation (TDD)
- [ ] BDD scenarios written for features
- [ ] Functions are small and focused
- [ ] Meaningful variable/function names
- [ ] No code duplication (DRY)
- [ ] Uses Result pattern instead of throwing exceptions
- [ ] Type safety (no `any` types)
- [ ] Dependencies injected via constructor
- [ ] Business logic in domain/use cases, not controllers
- [ ] No comments in code

---

## Common Patterns

### Repository Pattern

```typescript
interface IUserRepository {
  findById(id: string): Promise<Result<User, UserNotFoundError>>;
  save(user: User): Promise<Result<void, DatabaseError>>;
  delete(id: string): Promise<Result<void, DatabaseError>>;
}
```

### Use Case Pattern

```typescript
interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

interface CreateUserOutput {
  userId: string;
}

class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService
  ) {}

  async execute(
    input: CreateUserInput
  ): Promise<Result<CreateUserOutput, ValidationError | DatabaseError>> {
    const validationResult = this.validateInput(input);
    if (validationResult.isFailure) {
      return failure(validationResult.error);
    }

    const user = User.create(input);
    const saveResult = await this.userRepository.save(user);

    if (saveResult.isFailure) {
      return failure(saveResult.error);
    }

    await this.emailService.sendWelcomeEmail(user.email);

    return success({ userId: user.id });
  }

  private validateInput(input: CreateUserInput): Result<void, ValidationError> {
    if (!input.email.includes("@")) {
      return failure(new ValidationError("Invalid email"));
    }
    return success(undefined);
  }
}
```

### Dependency Injection

```typescript
const database = new Database(config);
const userRepository = new UserRepository(database);
const emailService = new EmailService(config);
const createUserUseCase = new CreateUserUseCase(userRepository, emailService);
```

---

## Anti-Patterns to Avoid

- **Anemic Domain Model**: Entities with only getters/setters, no behavior
- **God Classes**: Classes that do too much
- **Tight Coupling**: Direct dependencies on concrete classes
- **Business Logic in Controllers**: Keep controllers thin
- **Mixed Concerns**: One class doing validation, persistence, and business logic
- **Throwing Exceptions**: Use Result pattern for expected errors
- **No code Comments**: Write self-documenting code instead
- **Testing Implementation Details**: Test behavior, not internal structure
- **Skipping Tests**: Always write tests first (TDD)
- **Technical Language in BDD**: Use ubiquitous language in Gherkin scenarios

---

## When Working with Claude

- Always specify which layer you're working on (domain, application, infrastructure)
- Mention if you need adherence to specific SOLID principle
- Request Gherkin scenarios for new features (BDD)
- Ask for TDD test cases before implementation
- Specify if working on Entity, Value Object, Aggregate, or Domain Service
- Request DDD tactical patterns when modeling domain
- Ask for refactoring suggestions if code smells exist
- Request architecture diagrams when needed
- Mention bounded context when working on complex domains
