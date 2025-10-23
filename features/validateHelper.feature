Feature: Validate helper credentials
  As an admin
  I need to validate healthcare professionals' credentials and background screening
  So that qualified helpers can serve patients on the platform

  Background:
    Given I am authenticated as an admin

  Scenario: Validate helper to enable event applications
    Given helper "John Doe" has confirmed their email
    And "John Doe" has submitted their professional credentials
    And "John Doe" has submitted their background screening
    When I validate "John Doe"'s profile
    Then "John Doe" can apply to events
    And "John Doe" should no longer require my attention

  Scenario Outline: Cannot validate helper with incomplete requirements
    Given helper "Bob Martin" has confirmed their email
    And "Bob Martin" credentials submission status is <credentialsSubmitted>
    And "Bob Martin" background check submission status is <backgroundCheckSubmitted>
    When I attempt to validate "Bob Martin"
    Then validation should fail with error "<error>"
    And "Bob Martin" cannot apply to events

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
    Given helper "John Doe" is already validated
    When I attempt to validate "John Doe"
    Then validation should fail with error "Helper is already validated"
    And "John Doe" can still apply to events
