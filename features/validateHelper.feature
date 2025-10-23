Feature: Validate helper credentials
  As an admin
  I need to validate healthcare professionals' credentials and background screening
  So that qualified helpers can serve patients on the platform

  Background:
    Given I am authenticated as an admin

  Scenario: Validate helper to enable event applications
    Given helper "john.doe@example.com" has confirmed their email
    And "john.doe@example.com" has submitted their professional credentials
    And "john.doe@example.com" has submitted their background screening
    When I validate "john.doe@example.com"
    Then "john.doe@example.com" can apply to events
    And "john.doe@example.com" should no longer require my attention

  Scenario Outline: Cannot validate helper with incomplete requirements
    Given helper "bob.martin@example.com" has confirmed their email
    And "bob.martin@example.com" credentials submission status is <credentialsSubmitted>
    And "bob.martin@example.com" background check submission status is <backgroundCheckSubmitted>
    When I attempt to validate "bob.martin@example.com"
    Then validation should fail with error "<error>"
    And "bob.martin@example.com" cannot apply to events

    Examples: Missing credentials
      | credentialsSubmitted | backgroundCheckSubmitted | error                                   |
      | false                | true                     | Cannot validate without credentials     |

    Examples: Missing background check
      | credentialsSubmitted | backgroundCheckSubmitted | error                                        |
      | true                 | false                    | Cannot validate without background screening |

    Examples: Missing both
      | credentialsSubmitted | backgroundCheckSubmitted | error                                   |
      | false                | false                    | Cannot validate without credentials     |

  Scenario: Cannot validate already validated helper
    Given helper "john.doe@example.com" is already validated
    When I attempt to validate "john.doe@example.com"
    Then validation should fail with error "Helper is already validated"
    And "john.doe@example.com" can still apply to events

  Scenario: Cannot validate rejected helper
    Given helper "sarah.connor@example.com" has been rejected
    When I attempt to validate "sarah.connor@example.com"
    Then validation should fail with error "Cannot validate rejected helper"
    And "sarah.connor@example.com" cannot apply to events

  Scenario: Notify helper when validated
    Given helper "alice.brown@example.com" has confirmed their email
    And "alice.brown@example.com" has submitted their professional credentials
    And "alice.brown@example.com" has submitted their background screening
    When I validate "alice.brown@example.com"
    Then "alice.brown@example.com" should receive a validation notification

  Scenario: Cannot validate helper with unconfirmed email
    Given helper "charlie.davis@example.com" has not confirmed their email
    And "charlie.davis@example.com" has submitted their professional credentials
    And "charlie.davis@example.com" has submitted their background screening
    When I attempt to validate "charlie.davis@example.com"
    Then validation should fail with error "Cannot validate helper with unconfirmed email"
    And "charlie.davis@example.com" cannot apply to events

  Scenario: Multiple helpers with same name can be validated independently
    Given helper "john.smith.1@example.com" named "John Smith" has confirmed their email
    And "john.smith.1@example.com" has submitted their professional credentials
    And "john.smith.1@example.com" has submitted their background screening
    And helper "john.smith.2@example.com" named "John Smith" has confirmed their email
    And "john.smith.2@example.com" has submitted their professional credentials
    And "john.smith.2@example.com" has submitted their background screening
    When I validate "john.smith.1@example.com"
    Then "john.smith.1@example.com" can apply to events
    And "john.smith.2@example.com" cannot apply to events
