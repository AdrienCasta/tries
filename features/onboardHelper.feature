Feature: Onboarding a new helper
  As an admin
  I want to onboard qualified users as helpers
  So that they can access the platform and start assisting customers

  # Rule: Helper information must be valid and complete

  Scenario Outline: Admin successfully onboards a new helper with valid information
    Given the user's email is "<email>"
    And the user's first name is "<firstname>"
    And the user's last name is "<lastname>"
    When I onboard the user
    Then the user should be onboarded as a helper
    And the user should receive a notification

    Examples: Standard names
      | email              | firstname | lastname  |
      | john@doe.fr        | John      | Doe       |
      | jane.smith@acme.co | Jane      | Smith     |

    Examples: International and special characters
      | email                 | firstname | lastname    |
      | francois@paris.fr     | François  | Dubois      |
      | jose@madrid.es        | José      | García      |
      | anna@berlin.de        | Anne-Marie| Müller      |

    Examples: Names with hyphens and apostrophes
      | email                 | firstname | lastname    |
      | mary@example.com      | Mary-Jane | Watson      |
      | patrick@example.com   | Patrick   | O'Brien     |

  Scenario Outline: Admin cannot onboard helper with invalid email address
    Given I am onboarding a new helper
    And the email address is "<email>"
    And the first name is "John"
    And the last name is "Doe"
    When I onboard the user
    Then the onboarding fails with error "<error>"
    And the helper is not onboarded

    Examples: Invalid email formats
      | email           | error                    |
      | john@invalid    | Invalid email format     |
      | @example.com    | Invalid email format     |
      | john.doe        | Invalid email format     |
      | john@           | Invalid email format     |

    Examples: Missing email
      | email | error            |
      |       | Email is required|

  Scenario Outline: Admin cannot onboard helper with invalid name information
    Given I am onboarding a new helper
    And the email address is "john@domain.com"
    And the first name is "<firstname>"
    And the last name is "<lastname>"
    When I onboard the user
    Then the onboarding fails with error "<error>"
    And the helper is not onboarded

    Examples: Missing required fields
      | firstname | lastname | error                    |
      |           | Doe      | First name is required   |
      | John      |          | Last name is required    |

    Examples: Names too short
      | firstname | lastname | error                  |
      | J         | Doe      | First name too short   |
      | John      | D        | Last name too short    |

  Scenario: Admin cannot onboard helper with whitespace-only names
    Given I am onboarding a new helper
    And the email address is "john@domain.com"
    And the first name is "   "
    And the last name is "Doe"
    When I onboard the user
    Then the onboarding fails with error "First name is required"
    And the helper is not onboarded

  # Rule: System must handle edge cases gracefully

  Scenario Outline: Admin onboards helper with edge case valid emails
    Given the user's email is "<email>"
    And the user's first name is "John"
    And the user's last name is "Doe"
    When I onboard the user
    Then the user should be onboarded as a helper

    Examples: Special but valid email formats
      | email                          |
      | john+tag@example.com           |
      | john.doe.smith@example.com     |
      | john_doe@sub.example.com       |

  Scenario: Admin onboards helper with maximum length valid data
    Given the user's email is "very.long.email.address.that.is.still.valid@extremely-long-domain-name.com"
    And the user's first name is "Bartholomew"
    And the user's last name is "Montgomery-Smythe"
    When I onboard the user
    Then the user should be onboarded as a helper
    And the user should receive a notification
