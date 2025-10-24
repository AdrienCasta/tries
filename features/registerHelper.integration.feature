Feature: Register helper (Integration Tests)
  As a healthcare professional
  I want to register to the platform as a helper
  So that they can access the platform

Background:
    Given I am healthcare professional wishing to become an helper

  Scenario: Helper register successfully
    When I submit my information
    Then I am notified it went well
    And notified I have to confirm my email
