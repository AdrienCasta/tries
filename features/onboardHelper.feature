Feature: Onboarding a new helper
  As an admin
  I want to onboard qualified users as helpers
  So that they can access the platform and start assisting customers

  # Rule: Helper information must be valid and complete

  @e2e
  Scenario Outline: Admin successfully onboards a new helper with valid information
    Given the user's email is "<email>"
    And the user's first name is "<firstname>"
    And the user's last name is "<lastname>"
    And the user's phone number is "<phoneNumber>"
    And the user's profession is "<profession>"
    And the user's birthdate is "<birthdate>"
    And the user's county is "<frenchCounty>"
    When I onboard the user
    Then the user should be onboarded as a helper
    And the user should receive a notification

    Examples: Standard names
      | email                        | firstname | lastname  | phoneNumber  | profession      | birthdate  | frenchCounty |
      | john@doe.com                 | John      | Doe       | +33612345678 | physiotherapist | 1995-03-26 | 44           |

  Scenario Outline: Admin successfully onboards a new helper with phone number
    Given the user's email is "<email>"
    And the user's first name is "<firstname>"
    And the user's last name is "<lastname>"
    And the user's phone number is "<phoneNumber>"
    When I onboard the user
    Then the user should be onboarded as a helper
    And the user should receive a notification

    Examples: With phone numbers
      | email                        | firstname | lastname  | phoneNumber  |
      | helper@example.com           | John      | Smith     | +33612345678 |
      | helper+1@example.com         | John      | Smith     | +34612345678 |
      | helper+2@example.com         | Jane      | Doe       | 0612345678   |

    Examples: International and special characters
      | email                 | firstname | lastname    |
      | francois@paris.fr     | François  | Dubois      |
      | jose@madrid.es        | José      | García      |
      | anna@berlin.de        | Anne-Marie| Müller      |

    Examples: Names with hyphens and apostrophes
      | email                        | firstname | lastname    |
      | carole.turin@example.com     | Mary-Jane | Watson      |
      | patrick@example.com          | Patrick   | O'Brien     |
  
  Scenario Outline: Admin cannot onboard helper with invalid french county
    Given I am onboarding a new helper
    And the email address is carole.turin@example.com
    And the first name is "John"
    And the last name is "Doe"
    And the user's county is "<county>"
    When I onboard the user
    Then the onboarding fails with error "<error>"
    And the helper is not onboarded

    Examples: Invalid county formats
      | county | error                 |
      | 99     | Invalid french county |
      | ab     | Invalid french county |
      | -10    | Invalid french county |
      | 0.1    | Invalid french county |
      | 00     | Invalid french county |
      | 96     | Invalid french county |
      | 97     | Invalid french county |
      | 98     | Invalid french county |
      | 970    | Invalid french county |
      | 975    | Invalid french county |
      | 977    | Invalid french county |
      | 999    | Invalid french county |
      | 20     | Invalid french county |
      | 2C     | Invalid french county |
      | 2a     | Invalid french county |
      | 2b     | Invalid french county |
      |        | Invalid french county |
      | 1      | Invalid french county |
      | 001    | Invalid french county |
      | 4444   | Invalid french county |

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
      | email | error             |
      |       | Email is required |

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

  Scenario Outline: Admin cannot onboard helper with invalid phone number
    Given I am onboarding a new helper
    And the email address is "john@domain.com"
    And the first name is "John"
    And the last name is "Doe"
    And the phone number is "<phoneNumber>"
    When I onboard the user
    Then the onboarding fails with error "<error>"
    And the helper is not onboarded

    Examples: Invalid phone formats
      | phoneNumber      | error                  |
      | 06 123 456 789   | Phone number invalid   |
      | 011 23 45 67 89  | Phone number invalid   |
      | 612345678        | Phone number invalid   |
      | 06 12 34 56 7    | Phone number invalid   |

  Scenario Outline: Admin successfully onboards a helper with valid profession
    Given the user's email is "<email>"
    And the user's first name is "<firstname>"
    And the user's last name is "<lastname>"
    And the user's profession is "<profession>"
    When I onboard the user
    Then the user should be onboarded as a helper
    And the user should receive a notification

    Examples: Valid professions
      | email                   | firstname | lastname | profession              |
      | doctor@example.com      | John      | Smith    | doctor                  |
      | physio@example.com      | Jane      | Doe      | physiotherapist         |
      | coach@example.com       | Bob       | Brown    | sports_coach            |

  Scenario Outline: Admin cannot onboard helper with invalid profession
    Given I am onboarding a new helper
    And the email address is "john@domain.com"
    And the first name is "John"
    And the last name is "Doe"
    And the profession is "<profession>"
    When I onboard the user
    Then the onboarding fails with error "<error>"
    And the helper is not onboarded

    Examples: Invalid professions
      | profession       | error                  |
      | invalidprof      | Profession invalid     |
      | randomjob        | Profession invalid     |

  Scenario Outline: Admin cannot onboard helper with invalid birthdate
    Given I am onboarding a new helper
    Given It's 2025-10-06
    And the email address is <email>
    And the first name is "John"
    And the last name is "Doe"
    And the birthdate is <birthdate>
    When I onboard the user
    Then the onboarding fails because <error>
    And the helper is not onboarded

    Examples: Invalid birthdate
      | email           | birthdate  | error |
      | john@domain.com | 2025-10-07 | birthdate provided is set to the future.             |
      | john@domain.com | 2022-10-07 | age requirement not met. You must be at least 16 yo. |

  # Rule: Each helper must have a unique email address
  
  @e2e
  Scenario Outline: Admin cannot onboard a helper who is already registered
    Given a helper "<firstname>" "<lastname>" with email "<email>" is already onboarded
    When I attempt to onboard another helper "<otherUserFirstname>" "<otherUserLastname>" with same email
    Then the onboarding should fail because <error>
    And the helper should not be duplicated
    And no notification should be sent for the duplicate attempt

    Examples: Duplicate helper
      | email           | firstname | lastname | otherUserFirstname | otherUserLastname | error                                 |
      | john@domain.com | John      | Doe      | Michel             | Denis             | this email address is already in use. |

  # Rule: System must handle edge cases gracefully

  Scenario: Admin cannot onboard helper when system is temporarily unavailable
    Given I am onboarding a new helper with valid information
    And the system is temporarily unavailable
    When I attempt to onboard the user
    Then the onboarding should fail
    And the helper should not be onboarded
    And no notification should be sent

  # Scenario Outline: Admin onboards helper with edge case valid emails
  #   Given the user's email is "<email>"
  #   And the user's first name is "John"
  #   And the user's last name is "Doe"
  #   When I onboard the user
  #   Then the user should be onboarded as a helper

  #   Examples: Special but valid email formats
  #     | email                          |
  #     | john+tag@example.com           |
  #     | john.doe.smith@example.com     |
  #     | john_doe@sub.example.com       |

  # Scenario: Admin onboards helper with maximum length valid data
  #   Given the user's email is "very.long.email.address.that.is.still.valid@extremely-long-domain-name.com"
  #   And the user's first name is "Bartholomew"
  #   And the user's last name is "Montgomery-Smythe"
  #   When I onboard the user
  #   Then the user should be onboarded as a helper
  #   And the user should receive a notification

  # Scenario: Admin onboards helper and receives personalized notification
  #   Given the user's email is "sarah.connor@example.com"
  #   And the user's first name is "Sarah"
  #   And the user's last name is "Connor"
  #   When I onboard the user
  #   Then the user should receive a notification
  #   And the notification should contain "Hi Sarah Connor"
  #   And the notification should contain "Welcome to Tries"
  #   And the notification should contain "https://tries.fr/setup-password"
  #   And the notification should contain "tries@support.fr"
