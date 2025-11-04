Feature: Profile Completion
  As a new user
  I want to be prompted to complete my profile after first authentication
  So that I can provide my personal information

  Background:
    Given I am a new user

  Scenario: First-time user sees profile completion popup after email verification
    When I sign up with my email
    And I verify my email with the OTP code
    Then I should be redirected to the dashboard
    And I should see a profile completion dialog
    And the dialog should have firstname and lastname fields
    And the dialog should have a "Skip for now" button
    And the dialog should have a "Complete Profile" button

  Scenario: User can skip profile completion
    Given I have verified my email
    And I am on the dashboard
    And the profile completion dialog is displayed
    When I click "Skip for now"
    Then the dialog should close
    And I should still be on the dashboard

  Scenario: User completes their profile
    Given I have verified my email
    And I am on the dashboard
    And the profile completion dialog is displayed
    When I enter "Jean" as firstname
    And I enter "Dupont" as lastname
    And I click "Complete Profile"
    Then the dialog should close
    And my profile should be updated
    And the dialog should not appear on subsequent visits

  Scenario: Returning user with completed profile doesn't see popup
    Given I have previously completed my profile
    When I sign in with my email
    And I verify my email with the OTP code
    Then I should be redirected to the dashboard
    And I should not see a profile completion dialog
