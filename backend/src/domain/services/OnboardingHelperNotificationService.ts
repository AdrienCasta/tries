export interface OnboardingHelperNotificationService {
  send(email: string, message: string): Promise<void>;
  hasSentTo(email: string): Promise<boolean>;
}
