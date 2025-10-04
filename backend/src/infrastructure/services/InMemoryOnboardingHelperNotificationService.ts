import { OnboardedHelperNotificationService } from "../../domain/services/OnboardingHelperNotificationService.js";

export class FakeOnboardedHelperNotificationService
  implements OnboardedHelperNotificationService
{
  companyName: string;
  passwordSetupUrl: string;
  supportEmailContact: string;

  constructor({
    companyName,
    passwordSetupUrl,
    supportEmailContact,
  }: {
    companyName: string;
    passwordSetupUrl: string;
    supportEmailContact: string;
  }) {
    this.companyName = companyName;
    this.passwordSetupUrl = passwordSetupUrl;
    this.supportEmailContact = supportEmailContact;
  }

  private notifications: Map<string, string> = new Map();
  private notificationCounts: Map<string, number> = new Map();

  async send({
    email,
    firstname,
    lastname,
  }: {
    email: string;
    firstname: string;
    lastname: string;
  }): Promise<void> {
    this.notifications.set(
      email,
      this.generateTemplate({
        firstname,
        lastname,
      })
    );

    const currentCount = this.notificationCounts.get(email) || 0;
    this.notificationCounts.set(email, currentCount + 1);
  }

  async hasSentTo(email: string): Promise<boolean> {
    return this.notifications.has(email);
  }

  async getNotificationContent(email: string): Promise<string | null> {
    return this.notifications.get(email) || null;
  }

  async getNotificationCount(email: string): Promise<number> {
    return this.notificationCounts.get(email) || 0;
  }

  async clear() {
    this.notifications = new Map();
    this.notificationCounts = new Map();
  }

  private generateTemplate({
    firstname,
    lastname,
  }: {
    firstname: string;
    lastname: string;
  }) {
    return `
    Subject: Welcome to ${this.companyName} - Set Up Your Account
    
    Hi ${firstname} ${lastname},
    
    Welcome to the team! Your helper account has been created.
    
    To get started, please set up your password by clicking the link below:
    
    [Set Up My Password]
    ${this.passwordSetupUrl}
    
    This link will expire in 48 hours for security reasons.
    
    If you didn't expect this email or have any questions, please contact us at ${this.supportEmailContact}.
    
    Best regards,
    The ${this.companyName} Team
    
    ---
    This is an automated message. Please do not reply to this email.
    `;
  }
}
