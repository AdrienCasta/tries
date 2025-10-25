import {
  describeFeature,
  getVitestCucumberConfiguration,
  loadFeatureFromText,
  setVitestCucumberConfiguration,
} from "@amiceli/vitest-cucumber";

// @ts-ignore
import featureContent from "../../../../../features/confirmEmail.feature?raw";
import RegisterHelper from "@features/registerHelper/registerHelper.usecase";
import InMemoryAuthUserRepository from "@infrastructure/persistence/InMemoryAuthUserRepository";
import { FixedClock } from "@infrastructure/time/FixedClock";
import RegisterHelperCommandFixture from "@features/registerHelper/__tests__/fixtures/RegisterHelperCommandFixture";
import { ConfirmHelperEmail } from "../ConfirmHelperEmail.usecase";
import { EmailConfirmationService } from "@shared/domain/services/EmailConfirmationService";
import { Result, Success } from "@shared/infrastructure/Result";
import {
  InvalidTokenFormatError,
  TokenExpiredError,
  EmailAlreadyConfirmedError,
} from "../ConfirmHelperEmail.errors";
import AuthUserRepository from "@shared/domain/repositories/AuthUserRepository";
import { InMemoryHelperRepository } from "@infrastructure/persistence/InMemoryHelperRepository";
import { HelperRepository } from "@shared/domain/repositories/HelperRepository";
import { Helper } from "@shared/domain/entities/Helper";
import HelperEmail from "@shared/domain/value-objects/HelperEmail";
import Lastname from "@shared/domain/value-objects/Lastname";
import Firstname from "@shared/domain/value-objects/Firstname";
import Birthdate from "@shared/domain/value-objects/Birthdate";
import Profession, {
  ProfessionWithHealthId,
} from "@shared/domain/value-objects/Profession";
import Residence from "@shared/domain/value-objects/Residence";
import HelperId from "@shared/domain/value-objects/HelperId";
import PlaceOfBirth from "@shared/domain/value-objects/PlaceOfBirth";
const feature = await loadFeatureFromText(featureContent);

describeFeature(
  feature,
  ({ BeforeEachScenario, ScenarioOutline, Scenario, Background }) => {
    Scenario(
      "Successfully confirm email with valid token",
      ({ Given, When, Then, And }) => {
        const helperRepository = new InMemoryHelperRepository();
        const authUserRepository = new InMemoryAuthUserRepository();
        const command = RegisterHelperCommandFixture.aValidCommand();
        const clock = new FixedClock();
        const registerHelper = new RegisterHelper(authUserRepository, clock);
        Given(
          "I registered information including criminal record and diploma",
          async () => {
            await registerHelper.execute(command);
          }
        );
        And("I have never confirm my email before", () => {
          expect(
            authUserRepository.authUsers.get(command.email)?.emailConfirmed
          ).toBe(false);
        });
        When("I confirm my email", async () => {
          const aToken = "zertyui";
          const emailConfirmationService = new FakeEmailConfirmationService();
          const confirmEmail = new ConfirmHelperEmail(
            emailConfirmationService,
            authUserRepository,
            helperRepository
          );
          await confirmEmail.execute(command.email, aToken);
        });
        Then("I have been granted limited access", async () => {
          expect(
            authUserRepository.authUsers.get(command.email)?.emailConfirmed
          ).toBe(true);
        });
        And("I cannot apply to events", () => {});
        And("I should be pending review", async () => {
          expect(
            (
              (await helperRepository.findByEmail(command.email)) as Helper
            ).isPendingReview()
          ).toBe(true);
        });
      }
    );
  }
);

class FakeEmailConfirmationService implements EmailConfirmationService {
  async confirmEmail(token: string) {
    return Result.ok();
  }
}

class ConfirmHelperEmail {
  constructor(
    private readonly emailConfirmationService: EmailConfirmationService,
    private readonly authUserRepository: AuthUserRepository,
    private readonly helperRepository: HelperRepository
  ) {}

  async execute(email: string, token: string) {
    await this.authUserRepository.confirmEmail(email);
    const authUser = await this.authUserRepository.getUserByEmail(email);

    if (authUser) {
      await this.helperRepository.save(
        Helper.inPendingReview({
          id: HelperId.create(authUser.id),
          email: (HelperEmail.create(authUser.email) as Success<HelperEmail>)
            .value,
          lastname: (Firstname.create(authUser.lastname) as Success<Firstname>)
            .value,
          firstname: (Lastname.create(authUser.firstname) as Success<Lastname>)
            .value,
          birthdate: (
            Birthdate.create(new Date(authUser.birthdate)) as Success<Birthdate>
          ).value,

          residence: (
            (authUser.residence.country === "FR"
              ? Residence.createFrenchResidence(
                  authUser.residence.frenchAreaCode as string
                )
              : Residence.createFrenchResidence(
                  authUser.residence.country
                )) as Success<Residence>
          ).value,
          placeOfBirth: (
            PlaceOfBirth.create(authUser.placeOfBirth) as Success<PlaceOfBirth>
          ).value,
          professions: (
            Profession.createMany(
              authUser.professions.map((p) => p as ProfessionWithHealthId)
            ) as Success<Profession[]>
          ).value,
        })
      );
    }
  }
}
