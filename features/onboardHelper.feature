Feature: Onboarding a new helper
  As an admin
  I want to onboard qualified users as helpers
  So that they can access the platform and start applaying to events

  Background:
    Given the admin is authenticated

  # Rule: Helper information must be valid and complete

  @e2e
  @frontend
  @unit
  Scenario Outline: Admin onboards a qualified helper
    Given an admin has a qualified helper's information
    When the admin submits the onboarding request for "<firstname>" "<lastname>"
    Then a helper account is created for "<email>"
    And a welcome email is sent to "<email>"
    And the helper can access the Tries platform

    Examples:
      | email                    | firstname  | lastname |
      | john@doe.com             | John       | Doe      |
      | helper@example.com       | John       | Smith    |
      | francois@paris.fr        | François   | Dubois   |

  @e2e
  Scenario Outline: Admin cannot onboard a helper with duplicate email
    Given a helper "<firstname>" "<lastname>" with email "<email>" is already onboarded
    When an admin attempts to onboard a user with the same email
    Then the system rejects the request because <error>
    And the helper is not duplicated
    And no notification is sent

    Examples: Duplicate helper
      | email           | firstname | lastname | error                                 |
      | john@domain.com | John      | Doe      | this email address is already in use. |
      | john@domain.com | John      | Doe      | this email address is already in use. |

  
  @unit
  @integration
  Scenario Outline: Admin cannot onboard helper from invalid french county
    Given an admin attempts to onboard a helper from county "<county>"
    When the admin submits the onboarding request
    Then the system rejects the request with "<error>"
    And no helper account is created

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

  @unit
  @integration
  Scenario Outline: Admin cannot onboard helper with invalid email
    Given an admin attempts to onboard a helper with email "<email>"
    When the admin submits the onboarding request
    Then the system rejects the request with "<error>"
    And no helper account is created

    Examples: Invalid email formats
      | email           | error                    |
      | john@invalid    | Invalid email format     |
      | @example.com    | Invalid email format     |
      | john.doe        | Invalid email format     |
      | john@           | Invalid email format     |

    Examples: Missing email
      | email | error             |
      |       | Email is required |

  @unit
  @integration                                                                                                                                                                           
  Scenario Outline: Admin cannot onboard a helper with phone number already in use                                                                                                    
    Given a helper with phone number <phoneNumber> is already onboarded                                                                                                        
    When an admin attempts to onboard a user with the same phone number                                                                                                          
    Then the system rejects the request because <error>                                                                                                                          
    And no helper account is created                                                                                                                                             
                                                                                                                                                                                 
    Examples: Phone number already in use                                                                                                                                      
      | phoneNumber  | error                                |                                                                                                                 
      | +33612345678 | this phone number is already in use. | 

  @unit
  @integration
  Scenario Outline: Admin cannot onboard helper with invalid name
    Given an admin attempts to onboard a helper named "<firstname>" "<lastname>"
    When the admin submits the onboarding request
    Then the system rejects the request with "<error>"
    And no helper account is created

    Examples: Missing required fields
      | firstname | lastname | error                    |
      |           | Doe      | First name is required   |
      | John      |          | Last name is required    |

    Examples: Names too short
      | firstname | lastname | error                  |
      | J         | Doe      | First name too short   |
      | John      | D        | Last name too short    |

 @unit
 @integration
  Scenario Outline: Admin cannot onboard helper with invalid phone number
    Given an admin attempts to onboard a helper with phone number "<phoneNumber>"
    When the admin submits the onboarding request
    Then the system rejects the request with "<error>"
    And no helper account is created

    Examples: Invalid phone formats
      | phoneNumber      | error                  |
      | 06 123 456 789   | Phone number invalid   |
      | 011 23 45 67 89  | Phone number invalid   |
      | 612345678        | Phone number invalid   |
      | 06 12 34 56 7    | Phone number invalid   |


  @unit
  @integration
  Scenario Outline: Admin cannot onboard helper with invalid profession(s)
    Given an admin attempts to onboard a helper with professions <professions>
    When the admin submits the onboarding request
    Then the system rejects the request with <error>
    And no helper account is created

    Examples: Invalid profession(s)
      | professions                  | error              |
      |                              | Profession invalid |
      | invalidprof                  | Profession invalid |
      | physiotherapist, invalidprof | Profession invalid |

  @unit
  @integration
  Scenario Outline: Admin cannot onboard helper with invalid birthdate
    Given it is 2025-10-06
    And an admin attempts to onboard a helper born on <birthdate>
    When the admin submits the onboarding request
    Then the system rejects the request with <error>
    And no helper account is created

    Examples: Invalid birthdate
      | birthdate  | error |
      | 2025-10-07 | birthdate provided is set to the future.             |
      | 2022-10-07 | age requirement not met. You must be at least 16 yo. |

  Scenario: Admin cannot onboard helper when system is unavailable
    Given an admin has valid helper information
    And the system is temporarily unavailable
    When the admin attempts to onboard the helper
    Then the system cannot process the request
    And no helper account is created
    And no notification is sent
