Feature: Complete Email Verification Journey
  As a new user
  I want to sign up and verify my email with OTP
  So that I can access my account

  @integration
  Scenario: User completes signup and email verification successfully
    Given I am on the signup page
    When I submit my signup information
    Then I should be redirected to the email verification page
    And I should see my email address displayed
    When I enter the correct OTP code
    Then I should be redirected to the dashboard
    And my email should be verified in the system

  @integration
  Scenario: User can resend OTP code
    Given I am on the email verification page after signup
    When I click the resend OTP button
    Then I should see a confirmation that the code was resent
    And I should wait 60 seconds before I can resend again
    When I enter the new OTP code
    Then I should be redirected to the dashboard
