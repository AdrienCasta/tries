Feature: Manage helper validations
  As an admin
  I need to identify and validate helpers awaiting credential review
  So that qualified healthcare professionals can serve patients

  Background:
    Given I am authenticated as an admin

  Scenario: Identify helpers requiring my attention
    Given the following helpers exist:
      | firstname | lastname | emailConfirmed | credentialsSubmitted | backgroundCheckSubmitted | profileValidated |
      | John      | Doe      | true           | true                 | true                     | false            |
      | Jane      | Smith    | true           | true                 | true                     | false            |
      | Bob       | Martin   | false          | false                | false                    | false            |
      | Alice     | Wilson   | true           | true                 | true                     | true             |
    When I view helpers requiring validation
    Then I should see 2 helpers needing my attention
    And I should see "John Doe" marked as "ready for validation"
    And I should see "Jane Smith" marked as "ready for validation"
    But I should not see "Bob Martin"
    And I should not see "Alice Wilson"
