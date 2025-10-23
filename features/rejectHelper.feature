Feature: Reject helper credentials
  As an admin
  I need to reject healthcare professionals with invalid credentials or background issues
  So that only qualified helpers can serve patients on the platform

  Background:
    Given I am authenticated as an admin

  Scenario: Reject helper to prevent event applications
    Given helper "jane.smith@example.com" has confirmed their email
    And "jane.smith@example.com" has submitted their professional credentials
    And "jane.smith@example.com" has submitted their background screening
    When I reject "jane.smith@example.com"
    Then "jane.smith@example.com" cannot apply to events
    And "jane.smith@example.com" should no longer require my attention

  Scenario: Cannot reject already rejected helper
    Given helper "mike.ross@example.com" is already rejected
    When I attempt to reject "mike.ross@example.com"
    Then rejection should fail with error "Helper is already rejected"
    And "mike.ross@example.com" cannot apply to events

  Scenario: Notify helper when rejected
    Given helper "tom.wilson@example.com" has confirmed their email
    And "tom.wilson@example.com" has submitted their professional credentials
    And "tom.wilson@example.com" has submitted their background screening
    When I reject "tom.wilson@example.com"
    Then "tom.wilson@example.com" should receive a rejection notification

  Scenario: Cannot reject helper with unconfirmed email
    Given helper "emma.white@example.com" has not confirmed their email
    And "emma.white@example.com" has submitted their professional credentials
    And "emma.white@example.com" has submitted their background screening
    When I attempt to reject "emma.white@example.com"
    Then rejection should fail with error "Cannot reject helper with unconfirmed email"
    And "emma.white@example.com" cannot apply to events

  Scenario: Reject helper with invalid credentials reason
    Given helper "david.clark@example.com" has confirmed their email
    And "david.clark@example.com" has submitted their professional credentials
    And "david.clark@example.com" has submitted their background screening
    When I reject "david.clark@example.com" with reason "Invalid professional credentials"
    Then "david.clark@example.com" cannot apply to events
    And "david.clark@example.com" rejection reason should be "Invalid professional credentials"
    And "david.clark@example.com" should receive a rejection notification with reason

  Scenario: Reject helper with failed background check reason
    Given helper "nancy.lee@example.com" has confirmed their email
    And "nancy.lee@example.com" has submitted their professional credentials
    And "nancy.lee@example.com" has submitted their background screening
    When I reject "nancy.lee@example.com" with reason "Failed background screening"
    Then "nancy.lee@example.com" cannot apply to events
    And "nancy.lee@example.com" rejection reason should be "Failed background screening"
    And "nancy.lee@example.com" should receive a rejection notification with reason

  Scenario: Cannot reject without providing a reason
    Given helper "paul.gray@example.com" has confirmed their email
    And "paul.gray@example.com" has submitted their professional credentials
    And "paul.gray@example.com" has submitted their background screening
    When I attempt to reject "paul.gray@example.com" without a reason
    Then rejection should fail with error "Rejection reason is required"
    And "paul.gray@example.com" should not be rejected
