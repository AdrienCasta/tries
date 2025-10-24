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
    And "frank.martin@example.com" is pending review
    When I start reviewing "frank.martin@example.com"
    Then "frank.martin@example.com" should be under review

  Scenario: Helper under review is not pending review
    Given helper "reviewing@example.com" has confirmed their email
    And "reviewing@example.com" has submitted their professional credentials
    And "reviewing@example.com" has submitted their background screening
    And "reviewing@example.com" is pending review
    When I start reviewing "reviewing@example.com"
    Then "reviewing@example.com" should be under review
    And "reviewing@example.com" should not be pending review

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
    And "jack.smith@example.com" should not be pending review

  Scenario: Helper can resubmit after rejection
    Given helper "karen.davis@example.com" was rejected
    And "karen.davis@example.com" is not under review
    When "karen.davis@example.com" resubmits their professional credentials
    Then "karen.davis@example.com" rejection should be cleared
    And "karen.davis@example.com" should be pending review

  Scenario: Rejected helper can resubmit background check
    Given helper "laura.martinez@example.com" was rejected
    And "laura.martinez@example.com" is not under review
    When "laura.martinez@example.com" resubmits their background screening
    Then "laura.martinez@example.com" rejection should be cleared
    And "laura.martinez@example.com" should be pending review

  Scenario: Cannot start review on helper without complete documents
    Given helper "incomplete@example.com" has confirmed their email
    And "incomplete@example.com" has submitted their professional credentials
    And "incomplete@example.com" has NOT submitted their background screening
    When I attempt to start reviewing "incomplete@example.com"
    Then review should fail with error "Helper is not pending review"
    And "incomplete@example.com" should not be under review

  Scenario: Cannot start review on validated helper
    Given helper "validated@example.com" is already validated
    When I attempt to start reviewing "validated@example.com"
    Then review should fail with error "Helper is already validated"
    And "validated@example.com" should not be under review

  Scenario: Cannot start review on rejected helper
    Given helper "rejected@example.com" has been rejected
    When I attempt to start reviewing "rejected@example.com"
    Then review should fail with error "Helper has been rejected"
    And "rejected@example.com" should not be under review

  Scenario: Cannot start review on helper already under review
    Given helper "already-reviewing@example.com" is under review
    When I attempt to start reviewing "already-reviewing@example.com"
    Then review should fail with error "Helper is already under review"
    And "already-reviewing@example.com" should remain under review

  Scenario: Admin can review helper again after resubmission
    Given helper "resubmitted@example.com" was rejected
    And "resubmitted@example.com" has resubmitted their professional credentials
    And "resubmitted@example.com" is pending review
    When I start reviewing "resubmitted@example.com"
    Then "resubmitted@example.com" should be under review
