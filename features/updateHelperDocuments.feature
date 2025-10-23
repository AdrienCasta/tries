Feature: Update helper documents with auto-invalidation
  As a helper
  I need to update my professional documents
  So that my profile stays current, but validation is required again

  Scenario: Validated helper updates credentials
    Given helper "Robert Green" is validated
    And "Robert Green" can apply to events
    When "Robert Green" updates their professional credentials
    Then "Robert Green" validation status becomes invalid
    And "Robert Green" cannot apply to events
    And "Robert Green" should require admin attention

  Scenario: Validated helper updates background check
    Given helper "Linda Blue" is validated
    And "Linda Blue" can apply to events
    When "Linda Blue" updates their background screening
    Then "Linda Blue" validation status becomes invalid
    And "Linda Blue" cannot apply to events
    And "Linda Blue" should require admin attention
