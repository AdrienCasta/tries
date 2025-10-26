Feature: Confirm Helper Email
  As a helper
  I want to confirm my email address
  So that I can activate my account

  Background:
    Given I am a helper who registered on the platform

  Scenario: Successfully confirm email with valid token
    Given I registered information including criminal record and diploma
    And I have never confirm my email before
    When I confirm my email
    Then I have been granted limited access
    And I cannot apply to events
    And I should be pending review

  Scenario: Successfully confirm email without providing credential
    Given I registered information
    When I confirm my email
    Then I have been granted limited access
    And my profile should be incomplete

  Scenario: Successfully confirm email without providing criminal record
    Given I registered information
    When I confirm my email
    Then I have been granted limited access
    And my profile should be incomplete

  Scenario: Cannot confirm email when account does not exist
    Given I never registered on the platform
    When I confirm my email
    Then I should see "Account not found" error
    And my email should not be confirmed

  # Scenario Outline: Cannot confirm email with invalid token format
  #   Given a helper account exists with unconfirmed email
  #   When I confirm my email with token "<token>"
  #   Then the confirmation should fail with error "<error>"
  #   And my email should not be confirmed

  #   Examples:
  #     | token        | error                |
  #     |              | INVALID_TOKEN_FORMAT |
  #     | abc          | INVALID_TOKEN_FORMAT |
  #     | 12345        | INVALID_TOKEN_FORMAT |

  # Scenario: Cannot confirm email with expired token
  #   Given a helper account exists with unconfirmed email
  #   And the email confirmation token has expired
  #   When I confirm my email with the expired token
  #   Then the confirmation should fail with error "TOKEN_EXPIRED"
  #   And my email should not be confirmed

  # Scenario: Cannot confirm already confirmed email
    # Given a helper account exists with confirmed email
    # When I attempt to confirm my email again
    # Then the confirmation should fail with error "EMAIL_ALREADY_CONFIRMED"