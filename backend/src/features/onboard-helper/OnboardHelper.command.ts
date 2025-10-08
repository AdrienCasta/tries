export class OnboardHelperCommand {
  constructor(
    public readonly email: string,
    public readonly firstname: string,
    public readonly lastname: string,
    public readonly professions: string[],
    public readonly birthdate: Date,
    public readonly phoneNumber: string,
    public readonly frenchCounty: string
  ) {}
}
