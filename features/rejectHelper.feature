Feature: Reject helper credentials
  As an admin
  I need to reject healthcare professionals with invalid credentials or background issues
  So that only qualified helpers can serve patients on the platform

  Background:
    Given I am authenticated as an admin

  Scenario: Reject helper to prevent event applications
    Given helper "Jane Smith" has confirmed their email
    And "Jane Smith" has submitted their professional credentials
    And "Jane Smith" has submitted their background screening
    When I reject "Jane Smith"
    Then "Jane Smith" cannot apply to events
    And "Jane Smith" should no longer require my attention

  Scenario: Cannot reject already rejected helper
    Given helper "Mike Ross" is already rejected
    When I attempt to reject "Mike Ross"
    Then rejection should fail with error "Helper is already rejected"
    And "Mike Ross" cannot apply to events

  Scenario: Notify helper when rejected
    Given helper "Tom Wilson" has confirmed their email
    And "Tom Wilson" has submitted their professional credentials
    And "Tom Wilson" has submitted their background screening
    When I reject "Tom Wilson"
    Then "Tom Wilson" should receive a rejection notification

  Scenario: Cannot reject helper with unconfirmed email
    Given helper "Emma White" has not confirmed their email
    And "Emma White" has submitted their professional credentials
    And "Emma White" has submitted their background screening
    When I attempt to reject "Emma White"
    Then rejection should fail with error "Cannot reject helper with unconfirmed email"
    And "Emma White" cannot apply to events

  Scenario: Reject helper with invalid credentials reason
    Given helper "David Clark" has confirmed their email
    And "David Clark" has submitted their professional credentials
    And "David Clark" has submitted their background screening
    When I reject "David Clark" with reason "Invalid professional credentials"
    Then "David Clark" cannot apply to events
    And "David Clark" rejection reason should be "Invalid professional credentials"
    And "David Clark" should receive a rejection notification with reason

  Scenario: Reject helper with failed background check reason
    Given helper "Nancy Lee" has confirmed their email
    And "Nancy Lee" has submitted their professional credentials
    And "Nancy Lee" has submitted their background screening
    When I reject "Nancy Lee" with reason "Failed background screening"
    Then "Nancy Lee" cannot apply to events
    And "Nancy Lee" rejection reason should be "Failed background screening"
    And "Nancy Lee" should receive a rejection notification with reason

  Scenario: Cannot reject without providing a reason
    Given helper "Paul Gray" has confirmed their email
    And "Paul Gray" has submitted their professional credentials
    And "Paul Gray" has submitted their background screening
    When I attempt to reject "Paul Gray" without a reason
    Then rejection should fail with error "Rejection reason is required"
    And "Paul Gray" should not be rejected
