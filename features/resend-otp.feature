Feature: Resend OTP Code
  As a user verifying my email
  I want to request a new OTP code
  So that I can verify if my code expired or was lost

Background:
  Given I have signed up with an email address

Scenario: User requests new OTP successfully
  When I request a new OTP code
  Then a new OTP is sent to my email
  And I am notified to check my inbox

Scenario: Cannot request OTP for non-existent user
  Given I use an email that is not registered
  When I request a new OTP code
  Then the request fails with "User not found"

Scenario: New OTP invalidates previous OTP
  Given I have received an OTP code
  When I request a new OTP code
  And I try to verify with the old OTP
  Then verification should fail
  But verification succeeds with the new OTP
