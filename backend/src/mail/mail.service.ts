import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('MAIL_HOST');
    const user = this.config.get<string>('MAIL_USER');
    const pass = this.config.get<string>('MAIL_PASS');
    const port = Number(this.config.get<string>('MAIL_PORT') ?? '2525');
    this.from =
      this.config.get<string>('MAIL_FROM') ?? 'Antiqo <no-reply@antiqo.local>';

    if (host && user && pass) {
      this.transporter = createTransport({ host, port, auth: { user, pass } });
    } else {
      this.transporter = null;
    }
  }

  private async send(to: string, subject: string, text: string) {
    if (!this.transporter) {
      this.logger.warn(`Mailer not configured, skipped "${subject}" to ${to}`);
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, text });
    } catch (error) {
      this.logger.warn(`Could not send "${subject}" to ${to}: ${error}`);
    }
  }

  sendVerificationEmail(to: string, token: string) {
    return this.send(
      to,
      'Verify your Antiqo email',
      `Welcome to Antiqo. Use this token to verify your email: ${token}`,
    );
  }

  sendPasswordResetEmail(to: string, token: string) {
    return this.send(
      to,
      'Reset your Antiqo password',
      `Use this token to reset your password: ${token}`,
    );
  }

  sendWelcomeEmail(to: string, name: string) {
    return this.send(
      to,
      'Welcome to Antiqo',
      `Hi ${name}, your Antiqo account is ready. Happy hunting for vintage finds.`,
    );
  }

  sendOrderConfirmation(to: string, orderId: number, total: string) {
    return this.send(
      to,
      `Your Antiqo order #${orderId}`,
      `Thanks for shopping with Antiqo. Order #${orderId} is placed, total ${total}. We will email you as it moves along.`,
    );
  }

  sendReturnUpdate(to: string, returnId: number, status: string) {
    return this.send(
      to,
      `Your Antiqo return #${returnId}`,
      `There is an update on your return #${returnId}: it is now ${status}.`,
    );
  }
}