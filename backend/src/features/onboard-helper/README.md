# Onboard Helper Feature

## Overview

This feature allows administrators to onboard qualified users as helpers in the platform. When onboarded, helpers receive account credentials and can access the platform to assist customers.

## Use Case

**As an admin**
**I want to** onboard qualified users as helpers
**So that** they can access the platform and start assisting customers

## Business Rules

### 1. Helper Information Validation
- Email must be valid and in correct format
- First name is required (minimum 2 characters)
- Last name is required (minimum 2 characters)
- Supports international characters (accents, hyphens, apostrophes)

### 2. Unique Email Constraint
- Each helper must have a unique email address
- Duplicate email attempts are rejected
- Original helper data is preserved on duplicate attempts

### 3. Transactional Integrity
- Helper account and helper data are created atomically
- If account creation fails, helper is not saved
- Notifications are sent only on successful onboarding

### 4. Error Handling
- System failures are handled gracefully
- No partial data is persisted on errors
- Clear error messages for validation failures

## Architecture

This feature follows a **vertical slice architecture** where all related code lives together:

```
onboard-helper/
├── OnboardHelper.usecase.ts       # Core business logic
├── OnboardHelper.controller.ts    # HTTP request handling
├── OnboardHelper.routes.ts        # Route registration
├── OnboardHelper.dto.ts           # Request/Response DTOs
├── OnboardHelper.errors.ts        # Feature-specific errors
├── OnboardHelper.events.ts        # Domain events
├── __tests__/
│   ├── OnboardHelper.unit.test.ts        # Business logic tests
│   ├── OnboardHelper.integration.test.ts # HTTP + business logic
│   ├── OnboardHelper.e2e.test.ts         # Full stack with real DB
│   ├── OnboardHelperUnderTest.ts         # Unit test helper
│   └── OnboardHelperIntegrationTest.ts   # Integration test helper
└── README.md (this file)
```

## API Endpoint

### POST `/api/helpers/onboard`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "firstname": "John",
  "lastname": "Doe"
}
```

**Success Response (201):**
```json
{
  "helperId": "uuid-v4-string",
  "message": "Helper successfully onboarded"
}
```

**Error Response (400):**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Domain Events

### HelperOnboardingSucceeded
Emitted when a helper is successfully onboarded.
- `helperId`: Helper identifier
- `email`: Helper email
- `firstname`: Helper first name
- `lastname`: Helper last name
- `occurredAt`: Event timestamp

### HelperOnboardingFailed
Emitted when onboarding fails.
- `email`: Attempted email
- `firstname`: Attempted first name
- `lastname`: Attempted last name
- `reason`: Error message
- `error`: Error object
- `occurredAt`: Event timestamp

## Dependencies

### Domain Dependencies (Shared)
- `Helper` entity
- `HelperAccount` entity
- `HelperId` value object
- `HelperEmail` value object
- `Firstname` value object
- `Lastname` value object
- `Password` value object
- `HelperRepository` interface
- `HelperAccountRepository` interface
- `OnboardedHelperNotificationService` interface
- `Clock` interface

### Infrastructure Dependencies
- `Result<T, E>` for error handling
- `DomainEvent` for event publishing
- `EventBus` for event distribution
- `HttpServer` for HTTP abstraction

## Testing Strategy

### Unit Tests (44 tests, ~15-24ms)
- Tests business logic in isolation
- Uses in-memory test doubles
- Covers all validation scenarios
- Verifies error handling
- No HTTP or database interaction

### Integration Tests (44 tests, ~13-17ms)
- Tests HTTP layer + business logic
- Uses `FakeHttpServer` (lightweight)
- Uses in-memory repositories
- Verifies complete business flow
- Fast feedback loop

### E2E Tests (44 tests, ~1.7-2.9s)
- Tests critical scenarios only
- Uses real Fastify HTTP server
- Uses real Supabase database
- Verifies data persistence
- Validates transaction atomicity

## Example Usage

```typescript
import { OnboardHelper } from "./OnboardHelper.usecase";
import { InMemoryHelperRepository } from "../../infrastructure/persistence/InMemoryHelperRepository";
import { InMemoryHelperAccountRepository } from "../../infrastructure/persistence/InMemoryHelperAccountRepository";
import { FakeNotificationService } from "../../infrastructure/notifications/FakeNotificationService";
import { SystemClock } from "../../infrastructure/time/SystemClock";

const useCase = new OnboardHelper(
  new InMemoryHelperRepository(),
  new InMemoryHelperAccountRepository(),
  new FakeNotificationService(),
  new SystemClock()
);

const result = await useCase.execute({
  email: "jane@example.com",
  firstname: "Jane",
  lastname: "Smith"
});

if (Result.isSuccess(result)) {
  console.log(`Helper onboarded: ${result.value.value}`);
} else {
  console.error(`Onboarding failed: ${result.error.message}`);
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_EMAIL_ERROR` | Email format is invalid |
| `VALIDATION_ERROR` | First name or last name validation failed |
| `DUPLICATE_HELPER_ERROR` | Helper with email already exists |
| `CreateHelperAccountException` | Infrastructure failure creating account |

## Feature Files

Located in: `/features/onboardHelper.feature`

Scenarios covered:
- ✅ Valid helper onboarding (multiple examples)
- ✅ Invalid email validation
- ✅ Invalid name validation
- ✅ Duplicate email prevention
- ✅ System unavailability handling
