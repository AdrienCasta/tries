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

  Scenario Outline: Cannot register with duplicate email
    Given a helper with email "<email>" is already registered
    When I attempt to register with the same email
    Then I am notified it went wrong because <error>
    And I must use a different email to proceed

    Examples: Duplicate email
      | email           | error                                 |
      | john@domain.com | this email address is already in use. |

  Scenario Outline: Cannot register with duplicate phone number
    Given a helper with phone number "<phoneNumber>" is already registered
    When I attempt to register with the same phone number
    Then I am notified it went wrong because <error>
    And I must use a different phone number to proceed

    Examples: Duplicate phone number
      | phoneNumber  | error                                    |
      | +33612345678 | this phone number is already in use. |

  Scenario Outline: Cannot register with invalid birthdate
    Given it is <currentDate>
    When I submit my birthdate as <birthdate>
    Then I am notified it went wrong because <error>
    And I must provide a valid birthdate to proceed

    Examples: Future birthdate
      | currentDate | birthdate  | error                                    |
      | 2025-10-06  | 2025-10-07 | birthdate provided is set to the future. |

    Examples: Too young to work
      | currentDate | birthdate  | error                                            |
      | 2025-10-06  | 2022-10-07 | age requirement not met. You must be at least 16 yo. |

  Scenario Outline: Cannot register with invalid place of birth
    When I submit my place of birth with country "<country>" and city "<city>"
    Then I am notified it went wrong because <error>
    And I must provide a valid place of birth to proceed

    Examples: Missing country
      | country | city      | error                     |
      |         | Paris     | Place of birth incomplete |

    Examples: Missing city
      | country | city | error                     |
      | FR      |      | Place of birth incomplete |

  Scenario Outline: Cannot register with invalid profession
    When I submit my profession as "<profession>" with health ID "<healthIdType>" "<healthId>"
    Then I am notified it went wrong because <error>
    And I must provide valid profession information to proceed

    Examples: Unknown profession
      | profession  | healthIdType | healthId    | error              |
      | invalidprof | rpps         | 12345678901 | Profession unkwown |

    Examples: Invalid RPPS format
      | profession      | healthIdType | healthId   | error                       |
      | physiotherapist | rpps         | 123456789  | Rpps must be 11 digits long |

    Examples: Invalid ADELI format
      | profession   | healthIdType | healthId  | error                       |
      | sports_coach | adeli        | 12345678  | Adeli must be 9 digits long |

    Examples: Wrong health ID type for profession
      | profession      | healthIdType | healthId  | error                                        |
      | physiotherapist | adeli        | 123456789 | Profession requires different health id type |

  Scenario Outline: Cannot register with invalid residence
    When I submit my residence with country "<country>" and French area code "<frenchAreaCode>"
    Then I am notified it went wrong because <error>
    And I must provide a valid residence to proceed

    Examples: Invalid French area code
      | country | frenchAreaCode | error                     |
      | FR      | 99             | Invalid French area code |
      | FR      | 00             | Invalid French area code |
      | FR      |                | Invalid French area code |

    Examples: Unsupported country
      | country | frenchAreaCode | error             |
      | CA      |                | Invalid residence |
      | GB      |                | Invalid residence |

  Scenario Outline: Cannot register with invalid diploma file format
    When I submit my registration with a diploma file of type "<fileType>"
    Then I am notified it went wrong because <error>
    And I must provide a valid PDF diploma to proceed

    Examples: Invalid file formats
      | fileType | error                         |
      | .jpg     | Diploma must be in PDF format |
      | .png     | Diploma must be in PDF format |
      | .docx    | Diploma must be in PDF format |
      | .txt     | Diploma must be in PDF format |
      | .exe     | Diploma must be in PDF format |

  Scenario Outline: Cannot register with diploma file exceeding size limit
    When I submit my registration with a diploma file of size <fileSize>
    Then I am notified it went wrong because <error>
    And I must provide a diploma within the size limit to proceed

    Examples: File too large
      | fileSize | error                                |
      | 11MB     | Diploma file size exceeds 10MB limit |
      | 50MB     | Diploma file size exceeds 10MB limit |

  Scenario Outline: Cannot register with invalid criminal record certificate file format
    When I submit my registration with a criminal record certificate file of type "<fileType>"
    Then I am notified it went wrong because <error>
    And I must provide a valid PDF criminal record certificate to proceed

    Examples: Invalid file formats
      | fileType | error                                                 |
      | .jpg     | Criminal record certificate must be in PDF format |
      | .png     | Criminal record certificate must be in PDF format |
      | .docx    | Criminal record certificate must be in PDF format |
      | .txt     | Criminal record certificate must be in PDF format |
      | .exe     | Criminal record certificate must be in PDF format |

  Scenario Outline: Cannot register with criminal record certificate file exceeding size limit
    When I submit my registration with a criminal record certificate file of size <fileSize>
    Then I am notified it went wrong because <error>
    And I must provide a criminal record certificate within the size limit to proceed

    Examples: File too large
      | fileSize | error                                                        |
      | 11MB     | Criminal record certificate file size exceeds 10MB limit |
      | 50MB     | Criminal record certificate file size exceeds 10MB limit |

  Scenario Outline: Cannot register with empty criminal record certificate file
    When I submit my registration with an empty criminal record certificate file
    Then I am notified it went wrong because <error>
    And I must provide a valid criminal record certificate file to proceed

    Examples: Empty file
      | error                                           |
      | Criminal record certificate file is empty |