Feature: Resubmit helper documents with auto-invalidation
  As a helper
  I need to resubmit my professional documents when they change
  So that admins can re-validate my updated credentials

  Scenario: Validated helper resubmits credentials
    Given helper "Robert Green" is validated
    And "Robert Green" can apply to events
    When "Robert Green" resubmits their professional credentials
    Then "Robert Green" validation status becomes invalid
    And "Robert Green" cannot apply to events
    And "Robert Green" should require admin attention

  Scenario: Validated helper resubmits background check
    Given helper "Linda Blue" is validated
    And "Linda Blue" can apply to events
    When "Linda Blue" resubmits their background screening
    Then "Linda Blue" validation status becomes invalid
    And "Linda Blue" cannot apply to events
    And "Linda Blue" should require admin attention
