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

  private layout(heading: string, inner: string): string {
    return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#f4efe7;font-family:Georgia,'Times New Roman',serif;color:#3a2f26;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4efe7;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#fffdf9;border:1px solid #e6dccb;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(58,47,38,0.06);">
            <tr>
              <td style="background-color:#5a4433;padding:28px 40px;text-align:center;">
                <span style="font-size:26px;font-weight:bold;letter-spacing:4px;color:#f4efe7;text-transform:uppercase;">Antiqo</span>
                <div style="margin-top:6px;font-size:12px;letter-spacing:2px;color:#c7a97e;font-style:italic;">curated vintage finds</div>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 40px 28px 40px;">
                <h1 style="margin:0 0 18px 0;font-size:21px;font-weight:normal;color:#5a4433;">${heading}</h1>
                ${inner}
              </td>
            </tr>
            <tr>
              <td style="padding:22px 40px;background-color:#faf6ef;border-top:1px solid #e6dccb;text-align:center;">
                <div style="font-size:12px;color:#9a8b78;line-height:1.6;">
                  You are receiving this because an action was taken on your Antiqo account.<br />
                  &copy; ${new Date().getFullYear()} Antiqo &middot; A marketplace for vintage treasures
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  }

  private paragraph(text: string): string {
    return `<p style="margin:0 0 16px 0;font-size:16px;line-height:1.65;color:#3a2f26;">${text}</p>`;
  }

  private tokenBox(label: string, token: string): string {
    return `<div style="margin:24px 0;padding:18px 20px;background-color:#f4efe7;border:1px dashed #c7a97e;border-radius:10px;text-align:center;">
      <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#9a8b78;margin-bottom:10px;">${label}</div>
      <div style="font-family:'Courier New',monospace;font-size:18px;font-weight:bold;letter-spacing:1px;color:#5a4433;word-break:break-all;">${token}</div>
    </div>`;
  }

  private detailRow(label: string, value: string): string {
    return `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #efe7da;font-size:14px;color:#9a8b78;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #efe7da;font-size:15px;font-weight:bold;color:#3a2f26;text-align:right;">${value}</td>
    </tr>`;
  }

  private detailTable(rows: string): string {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px 0;">${rows}</table>`;
  }

  sendVerificationEmail(to: string, token: string) {
    const inner =
      this.paragraph('Welcome to Antiqo! One quick step to confirm it is you.') +
      this.paragraph('Use the verification token below to activate your email address. It stays valid for 24 hours.') +
      this.tokenBox('Verification token', token) +
      this.paragraph('If you did not create an Antiqo account, you can safely ignore this message.');
    return this.send(
      to,
      'Verify your Antiqo email',
      this.layout('Confirm your email', inner),
    );
  }

  sendPasswordResetEmail(to: string, token: string) {
    const inner =
      this.paragraph('We received a request to reset the password on your Antiqo account.') +
      this.paragraph('Use the token below to set a new password. For your security, it expires in 1 hour.') +
      this.tokenBox('Password reset token', token) +
      this.paragraph('Did not request this? No action is needed — your password stays the same.');
    return this.send(
      to,
      'Reset your Antiqo password',
      this.layout('Reset your password', inner),
    );
  }

  sendWelcomeEmail(to: string, name: string) {
    const inner =
      this.paragraph(`Hi ${name},`) +
      this.paragraph('Your Antiqo account is ready. Explore a curated marketplace of vintage pieces, place offers, and track every order from checkout to doorstep.') +
      this.paragraph('Happy hunting for timeless finds.');
    return this.send(
      to,
      'Welcome to Antiqo',
      this.layout('Welcome aboard', inner),
    );
  }

  sendOrderConfirmation(to: string, orderId: number, total: string) {
    const inner =
      this.paragraph('Thanks for shopping with Antiqo — your order is confirmed.') +
      this.detailTable(
        this.detailRow('Order number', `#${orderId}`) +
          this.detailRow('Order total', total) +
          this.detailRow('Status', 'Placed'),
      ) +
      this.paragraph('We will email you with each update as your order moves along.');
    return this.send(
      to,
      `Your Antiqo order #${orderId}`,
      this.layout('Order confirmed', inner),
    );
  }

  sendReturnUpdate(to: string, returnId: number, status: string) {
    const inner =
      this.paragraph('There is an update on your Antiqo return request.') +
      this.detailTable(
        this.detailRow('Return number', `#${returnId}`) +
          this.detailRow('Current status', status),
      ) +
      this.paragraph('We will keep you posted as the return progresses.');
    return this.send(
      to,
      `Your Antiqo return #${returnId}`,
      this.layout('Return update', inner),
    );
  }
}
