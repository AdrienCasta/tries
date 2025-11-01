Feature: Email Verification with OTP
  As a user who signed up
  I want to verify my email address using OTP
  So that I can confirm my account

Background:
  Given I am a user who has signed up

Scenario: User verifies email successfully
  When I submit a valid OTP code
  Then my email is verified
  And I am notified verification was successful

Scenario Outline: Cannot verify with invalid OTP format
  When I submit OTP code "<code>"
  Then verification fails with "<error>"
  And I am notified to check the code

  Examples: Invalid OTP formats
    | code    | error                        |
    | 12345   | OTP must be 6 digits         |
    | 1234567 | OTP must be 6 digits         |
    | abc123  | OTP must contain only digits |
    |         | OTP is required              |

Scenario: Cannot verify with expired OTP
  Given I have an expired OTP code
  When I submit the expired OTP
  Then verification fails with "OTP expired"
  And I am prompted to request a new code

Scenario: Cannot verify with wrong OTP
  Given I have a valid OTP in my email
  When I submit a different 6-digit code
  Then verification fails with "Invalid OTP"
  And I can retry with the correct code
