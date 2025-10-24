Feature: Update helper profile with validation invalidation
  As a helper
  I need to update my credentials when they change
  So that admins can verify my updated information

  Scenario: Validated helper updates credentials
    Given helper "robert.green@example.com" is validated
    And "robert.green@example.com" can apply to events
    When "robert.green@example.com" updates their professional credentials
    Then "robert.green@example.com" validation status becomes invalid
    And "robert.green@example.com" cannot apply to events
    And "robert.green@example.com" should be pending review

  Scenario: Validated helper updates background check
    Given helper "linda.blue@example.com" is validated
    And "linda.blue@example.com" can apply to events
    When "linda.blue@example.com" updates their background screening
    Then "linda.blue@example.com" validation status becomes invalid
    And "linda.blue@example.com" cannot apply to events
    And "linda.blue@example.com" should be pending review

  Scenario: Pending review helper can update credentials
    Given helper "charlie.brown@example.com" has confirmed their email
    And "charlie.brown@example.com" has submitted their professional credentials
    And "charlie.brown@example.com" has submitted their background screening
    And "charlie.brown@example.com" is pending review
    When "charlie.brown@example.com" updates their professional credentials
    Then update should succeed
    And "charlie.brown@example.com" should remain pending review

  Scenario: Pending review helper can update background check
    Given helper "diana.prince@example.com" has confirmed their email
    And "diana.prince@example.com" has submitted their professional credentials
    And "diana.prince@example.com" has submitted their background screening
    And "diana.prince@example.com" is pending review
    When "diana.prince@example.com" updates their background screening
    Then update should succeed
    And "diana.prince@example.com" should remain pending review
