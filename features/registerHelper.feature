Feature: Register helper
  As a healthcare professional 
  I want to register to the platform as a helper
  So that they can access the platform

Background:
    Given I am healthcare professional wishing to become an helper

  Scenario: Helper register successfully
    When I submit my information
    Then I am notified it went well
    And notified I have to confirm my email

  Scenario Outline: Helper fail to register with invalid email
    When I submit my information with an invalid email <email>  
    Then I am notified it went wrong because of <error>
    And notified I have to change my email

    Examples: Invalid email formats
      | email        | error                |
      | john@invalid | Invalid email format |
      | @example.com | Invalid email format |
      | john.doe     | Invalid email format |
      | john@        | Invalid email format |

    Examples: Missing email
      | email | error             |
      |       | Email is required |

  Scenario Outline: Fail to register with invalid name
    When I submit my information with an invalid name <firstname> <lastname>  
    Then I am notified it went wrong because <error>
    And notified I have to change my name information

    Examples: Missing required fields
      | firstname | lastname | error                    |
      |           | Doe      | First name is required   |
      | John      |          | Last name is required    |

    Examples: Names too short
      | firstname | lastname | error                  |
      | J         | Doe      | First name too short   |
      | John      | D        | Last name too short    |

  Scenario Outline: Fail to register with invalid phone number
    When I submit my information with an invalid phone number: <phoneNumber>
    Then I am notified it went wrong because <error>
    And notified I have to change my phone number information

    Examples: Invalid phone number formats
      | phoneNumber      | error                  |
      | 06 123 456 789   | Phone number invalid   |
      | 011 23 45 67 89  | Phone number invalid   |
      | 612345678        | Phone number invalid   |
      | 06 12 34 56 7    | Phone number invalid   |

    Examples: Empty phone number
      | phoneNumber      | error                  |
      |                  | Phone number invalid   |