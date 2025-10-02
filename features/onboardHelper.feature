Feature: Onboarding a new helper
  As an admin
  I want to onboard a new user as a helper
  So that they can access the platform and start assisting

  Scenario Outline: Successfully onboarding a new user as a helper
    Given the user's email is "<email>"
    And the user's first name is "<firstname>"
    And the user's last name is "<lastname>"
    When I onboard the user
    Then the user should be onboarded as a helper
    And the user should receive a notification

    Examples:
      | email       | firstname | lastname |
      | john@doe.fr | John      | Doe      |
  
    Scenario Outline: Fail to onboard due to invalid user information
      Given the user's email is "<email>"
      And the user's first name is "<firstname>"
      And the user's last name is "<lastname>"
      When I onboard the user
      Then the user should not be onboarded as a helper
      And admin is notfified of what went wrong
      Examples:
        | email         | firstname | lastname | error |
        | badmaildoe.fr | John      | Doe      | "email invalid"
