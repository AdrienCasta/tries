Feature: Lock helper documents during admin review
  As an admin
  I need to lock helper documents when I start reviewing
  So that helpers cannot change documents while I'm reviewing them

  Background:
    Given I am authenticated as an admin

  Scenario: Admin starts reviewing helper to lock documents
    Given helper "Frank Martin" has confirmed their email
    And "Frank Martin" has submitted their professional credentials
    And "Frank Martin" has submitted their background screening
    And "Frank Martin" requires admin attention
    When I start reviewing "Frank Martin"
    Then "Frank Martin" documents should be locked
    And "Frank Martin" should be under review

  Scenario: Cannot resubmit credentials while under review
    Given helper "Grace Wilson" is under review
    When "Grace Wilson" attempts to resubmit their professional credentials
    Then resubmission should fail with error "Cannot resubmit documents while under admin review"
    And "Grace Wilson" documents should remain locked

  Scenario: Cannot resubmit background check while under review
    Given helper "Henry Lee" is under review
    When "Henry Lee" attempts to resubmit their background screening
    Then resubmission should fail with error "Cannot resubmit documents while under admin review"
    And "Henry Lee" documents should remain locked

  Scenario: Validating helper unlocks documents
    Given helper "Iris Brown" is under review
    When I validate "Iris Brown"'s profile
    Then "Iris Brown" documents should be unlocked
    And "Iris Brown" can apply to events

  Scenario: Rejecting helper unlocks documents
    Given helper "Jack Smith" is under review
    When I reject "Jack Smith" with reason "Invalid credentials"
    Then "Jack Smith" documents should be unlocked
    And "Jack Smith" cannot apply to events
    And "Jack Smith" should not require admin attention

  Scenario: Helper can resubmit after rejection unlocks documents
    Given helper "Karen Davis" was rejected
    And "Karen Davis" documents are unlocked
    When "Karen Davis" resubmits their professional credentials
    Then "Karen Davis" rejection should be cleared
    And "Karen Davis" should require admin attention
