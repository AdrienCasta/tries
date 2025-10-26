Feature: Confirm Helper Email
  As a helper
  I want to confirm my email address
  So that I can activate my account

  Background:
    Given I am a helper who registered on the platform

  @integration
  Scenario: Successfully confirm email with valid token
    Given I registered information including criminal record and diploma
    And I have never confirm my email before
    When I confirm my email
    Then I have been granted limited access
    And I cannot apply to events
    And I should be pending review

  @integration
  Scenario: Successfully confirm email without providing credential
    Given I registered information
    When I confirm my email
    Then I have been granted limited access
    And my profile should be incomplete

  Scenario: Successfully confirm email without providing criminal record
    Given I registered information
    When I confirm my email
    Then I have been granted limited access
    And my profile should be incomplete

  Scenario: Cannot confirm email when account does not exist
    Given I never registered on the platform
    When I confirm my email
    Then I should see "Account not found" error
    And my email should not be confirmed

  Scenario: Cannot confirm email when system fails to save
    Given I registered information
    And the system encounters an error while saving
    When I confirm my email
    Then I should see "System error" message
    And my email should not be confirmed