Feature: Reject helper credentials
  As an admin
  I need to reject healthcare professionals with invalid credentials or background issues
  So that only qualified helpers can serve patients on the platform

  Background:
    Given I am authenticated as an admin

  Scenario: Reject helper to prevent platform access
    Given helper "Jane Smith" has confirmed their email
    And "Jane Smith" has submitted their professional credentials
    And "Jane Smith" has submitted their background screening
    When I reject "Jane Smith"
    Then "Jane Smith" should be marked as rejected
    And "Jane Smith" should no longer require my attention
