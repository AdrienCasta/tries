export interface OnboardedHelperNotificationService {
  send(data: {
    email: string;
    firstname: string;
    lastname: string;
    phoneNumber?: string;
    professions?: string[];
  }): Promise<void>;
  hasSentTo(email: string): Promise<boolean>;
}
