export class OnboardHelperCommand {
  constructor(
    public readonly email: string,
    public readonly firstname: string,
    public readonly lastname: string,
    public readonly phoneNumber?: string,
    public readonly professions?: string[]
  ) {}
}
