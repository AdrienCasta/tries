Feature: Validate helper credentials
  As an admin
  I need to validate healthcare professionals' credentials and background screening
  So that qualified helpers can serve patients on the platform

  Background:
    Given I am authenticated as an admin

  Scenario: Validate helper to grant platform access
    Given helper "John Doe" has confirmed their email
    And "John Doe" has submitted their professional credentials
    And "John Doe" has submitted their background screening
    When I validate "John Doe"'s profile
    Then "John Doe" should be able to access the platform
    And "John Doe" should no longer require my attention
