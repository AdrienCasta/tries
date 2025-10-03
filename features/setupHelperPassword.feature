Feature: Helper password setup
  As a helper
  I want to set up my password using the link sent by email
  So that I can access the platform securely

  # Rule: Password must meet security requirements

  Scenario: Helper successfully sets up password with valid token
    Given a helper with email "john@example.com" has been onboarded
    And the helper has not set up a password yet
    And a valid password setup token exists
    When the helper submits password "SecureP@ss123" with the token
    Then the password should be set successfully
    And the helper can authenticate with the password
    And the password setup token should be invalidated

  Scenario Outline: Helper cannot set weak passwords
    Given a helper with a valid password setup token
    When the helper submits password "<password>" with the token
    Then the password setup should fail with error "<error>"
    And the helper should not have a password set

    Examples: Weak passwords
      | password    | error                           |
      | short       | Password too short              |
      | alllower123 | Password must contain uppercase |
      | ALLUPPER123 | Password must contain lowercase |
      | NoNumbers!  | Password must contain number    |
      | NoSpecial1  | Password must contain special   |

  Scenario: Helper cannot use expired token
    Given a helper was onboarded 49 hours ago
    And the helper has not set up a password yet
    When the helper attempts to set password with the expired token
    Then the password setup should fail with error "Token expired"
    And the helper should not have a password set

  Scenario: Helper cannot use invalid token
    Given a helper with email "jane@example.com" exists
    When the helper attempts to set password with invalid token "fake-token-123"
    Then the password setup should fail with error "Invalid token"

  Scenario: Helper cannot set password twice
    Given a helper with email "bob@example.com" has been onboarded
    And the helper has already set up their password
    When the helper attempts to set password "NewP@ssword123" again
    Then the password setup should fail with error "Password already set"
