import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const user = this.config.get<string>('MAIL_USER') || '';
    const pass = this.config.get<string>('MAIL_PASS') || '';
    this.from =
      this.config.get<string>('MAIL_FROM') || user || 'no-reply@antiqo.local';

    if (user && pass) {
      this.transporter = createTransport({
        host: this.config.get<string>('MAIL_HOST') || 'smtp.gmail.com',
        port: Number(this.config.get('MAIL_PORT') ?? 587),
        secure: this.config.get('MAIL_SECURE') === 'true',
        auth: { user, pass },
      });
    } else {
      this.transporter = null;
      this.logger.warn(
        'Mail is not configured (MAIL_USER/MAIL_PASS missing); emails will be skipped.',
      );
    }
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        `Skipped email to ${to} ("${subject}") — mailer not configured.`,
      );
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${(error as Error).message}`,
      );
    }
  }

  sendVerificationEmail(to: string, token: string) {
    return this.send(
      to,
      'Verify your Antiqo email',
      `<p>Welcome to Antiqo.</p><p>Use this token to verify your email:</p><p><strong>${token}</strong></p>`,
    );
  }

  sendPasswordResetEmail(to: string, token: string) {
    return this.send(
      to,
      'Reset your Antiqo password',
      `<p>Use this token to reset your password:</p><p><strong>${token}</strong></p>`,
    );
  }

  sendWelcomeEmail(to: string, name: string) {
    return this.send(
      to,
      'Welcome to Antiqo',
      `<p>Hi ${name},</p><p>Your Antiqo account is ready. Happy hunting for vintage finds.</p>`,
    );
  }

  sendOrderConfirmation(to: string, orderId: number, total: string) {
    return this.send(
      to,
      `Your Antiqo order #${orderId}`,
      `<p>Thanks for shopping with Antiqo.</p><p>Order <strong>#${orderId}</strong> is placed, total <strong>${total}</strong>. We will email you as it moves along.</p>`,
    );
  }

  sendReturnUpdate(to: string, returnId: number, status: string) {
    return this.send(
      to,
      `Your Antiqo return #${returnId}`,
      `<p>There is an update on your return <strong>#${returnId}</strong>: it is now <strong>${status}</strong>.</p>`,
    );
  }
}
