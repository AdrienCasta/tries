Feature: Admin review process
  As an admin
  I need to mark helpers as under review when I start reviewing
  So that helpers cannot change documents while I'm reviewing them

  Background:
    Given I am authenticated as an admin

  Scenario: Admin starts reviewing helper
    Given helper "frank.martin@example.com" has confirmed their email
    And "frank.martin@example.com" has submitted their professional credentials
    And "frank.martin@example.com" has submitted their background screening
    And "frank.martin@example.com" requires admin attention
    When I start reviewing "frank.martin@example.com"
    Then "frank.martin@example.com" should be under review

  Scenario: Cannot resubmit credentials while under review
    Given helper "grace.wilson@example.com" is under review
    When "grace.wilson@example.com" attempts to resubmit their professional credentials
    Then resubmission should fail with error "Cannot resubmit documents while under admin review"
    And "grace.wilson@example.com" should remain under review

  Scenario: Cannot resubmit background check while under review
    Given helper "henry.lee@example.com" is under review
    When "henry.lee@example.com" attempts to resubmit their background screening
    Then resubmission should fail with error "Cannot resubmit documents while under admin review"
    And "henry.lee@example.com" should remain under review

  Scenario: Validating helper completes review
    Given helper "iris.brown@example.com" is under review
    When I validate "iris.brown@example.com"
    Then "iris.brown@example.com" should not be under review
    And "iris.brown@example.com" can apply to events

  Scenario: Rejecting helper completes review
    Given helper "jack.smith@example.com" is under review
    When I reject "jack.smith@example.com" with reason "Invalid credentials"
    Then "jack.smith@example.com" should not be under review
    And "jack.smith@example.com" cannot apply to events
    And "jack.smith@example.com" should not require admin attention

  Scenario: Helper can resubmit after rejection
    Given helper "karen.davis@example.com" was rejected
    And "karen.davis@example.com" is not under review
    When "karen.davis@example.com" resubmits their professional credentials
    Then "karen.davis@example.com" rejection should be cleared
    And "karen.davis@example.com" should require admin attention
