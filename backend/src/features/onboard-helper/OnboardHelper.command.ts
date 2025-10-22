export class OnboardHelperCommand {
  constructor(
    public readonly email: string,
    public readonly firstname: string,
    public readonly lastname: string,
    public readonly professions: {
      code: string;
      healthId: { rpps: string } | { adeli: string };
    }[],
    public readonly birthdate: Date,
    public readonly phoneNumber: string,
    public readonly residence: {
      country: string;
      frenchAreaCode: string;
    },
    public readonly placeOfBirth: {
      country: string;
      city: string;
      zipCode?: string;
    }
  ) {}
}
