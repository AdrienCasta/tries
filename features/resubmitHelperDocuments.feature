Feature: Resubmit helper documents with auto-invalidation
  As a helper
  I need to resubmit my professional documents when they change
  So that admins can re-validate my updated credentials

  Scenario: Validated helper resubmits credentials
    Given helper "robert.green@example.com" is validated
    And "robert.green@example.com" can apply to events
    When "robert.green@example.com" resubmits their professional credentials
    Then "robert.green@example.com" validation status becomes invalid
    And "robert.green@example.com" cannot apply to events
    And "robert.green@example.com" should be pending review

  Scenario: Validated helper resubmits background check
    Given helper "linda.blue@example.com" is validated
    And "linda.blue@example.com" can apply to events
    When "linda.blue@example.com" resubmits their background screening
    Then "linda.blue@example.com" validation status becomes invalid
    And "linda.blue@example.com" cannot apply to events
    And "linda.blue@example.com" should be pending review
