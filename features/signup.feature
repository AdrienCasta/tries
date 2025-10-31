Feature: User Signup
  As a new user
  I want to sign up for an account
  So that I can access the platform

Background:
  Given I am a new user wishing to sign up

@integration
Scenario: User signs up successfully
  When I submit my signup information
  Then I am notified signup was successful
  And notified I have to confirm my email

Scenario Outline: Cannot sign up with invalid email
  When I submit signup with email "<email>"
  Then I am notified it went wrong because of <error>
  And notified I have to provide a valid email

  Examples: Invalid email formats
    | email           | error                |
    | john@invalid    | Invalid email format |
    | @example.com    | Invalid email format |
    | john.doe        | Invalid email format |
    | john@           | Invalid email format |

  Examples: Missing email
    | email | error             |
    |       | Email is required |

Scenario Outline: Cannot sign up with invalid password
  When I submit signup with password "<password>"
  Then I am notified it went wrong because of <error>
  And notified I have to provide a valid password

  Examples: Password too short
    | password | error                |
    | Pass1!   | Password too short   |

  Examples: Password missing uppercase
    | password   | error                    |
    | password1! | Password format invalid  |

  Examples: Password missing lowercase
    | password   | error                    |
    | PASSWORD1! | Password format invalid  |

  Examples: Password missing number
    | password   | error                    |
    | Password!  | Password format invalid  |

  Examples: Password missing special char
    | password   | error                    |
    | Password1  | Password format invalid  |

  Examples: Missing password
    | password | error                |
    |          | Password is required |

Scenario: Cannot sign up with duplicate email
  Given a user with email "john@example.com" already exists
  When I attempt to sign up with the same email
  Then I am notified it went wrong because "Email already in use"
  And I must use a different email to proceed
