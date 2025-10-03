export interface OnboardedHelperNotificationService {
  send(data: {
    email: string;
    firstname: string;
    lastname: string;
  }): Promise<void>;
  hasSentTo(email: string): Promise<boolean>;
}
