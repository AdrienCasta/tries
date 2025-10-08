Feature: Confirm Helper Email
  As a helper
  I want to confirm my email address
  So that I can activate my account

  @e2e
  Scenario: Successfully confirm email with valid token
    Given a helper account exists with unconfirmed email
    When I confirm my email with a valid token
    Then my email should be confirmed
    And my account should be activated

  Scenario Outline: Cannot confirm email with invalid token format
    Given a helper account exists with unconfirmed email
    When I confirm my email with token "<token>"
    Then the confirmation should fail with error "<error>"
    And my email should not be confirmed

    Examples:
      | token        | error                |
      |              | INVALID_TOKEN_FORMAT |
      | abc          | INVALID_TOKEN_FORMAT |
      | 12345        | INVALID_TOKEN_FORMAT |

  Scenario: Cannot confirm email with expired token
    Given a helper account exists with unconfirmed email
    And the email confirmation token has expired
    When I confirm my email with the expired token
    Then the confirmation should fail with error "TOKEN_EXPIRED"
    And my email should not be confirmed

  Scenario: Cannot confirm already confirmed email
    Given a helper account exists with confirmed email
    When I attempt to confirm my email again
    Then the confirmation should fail with error "EMAIL_ALREADY_CONFIRMED"