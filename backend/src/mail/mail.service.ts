import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;
  private readonly appUrl: string;

  private readonly font =
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Helvetica,Arial,sans-serif";
  private readonly gradient =
    'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%)';

  constructor(private readonly config: ConfigService) {
    const user = this.config.get<string>('MAIL_USER') || '';
    const pass = this.config.get<string>('MAIL_PASS') || '';
    this.from =
      this.config.get<string>('MAIL_FROM') || user || 'no-reply@antiqo.local';
    this.appUrl = (
      this.config.get<string>('APP_URL') || 'http://localhost:3000'
    ).replace(/\/+$/, '');

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
  <body style="margin:0;padding:0;background-color:#eef0fb;font-family:${this.font};color:#3a3550;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef0fb;padding:40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(99,102,241,0.15);">
            <tr>
              <td style="background-color:#7c3aed;background-image:${this.gradient};padding:40px 40px 36px 40px;text-align:center;">
                <a href="${this.appUrl}" style="text-decoration:none;">
                  <span style="font-size:30px;font-weight:800;letter-spacing:3px;color:#ffffff;text-transform:uppercase;">Antiqo</span>
                </a>
                <div style="margin-top:8px;font-size:13px;letter-spacing:3px;color:rgba(255,255,255,0.85);text-transform:uppercase;">Curated Vintage Finds</div>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 44px 32px 44px;">
                <h1 style="margin:0 0 20px 0;font-size:24px;font-weight:700;color:#1e1b4b;">${heading}</h1>
                ${inner}
              </td>
            </tr>
            <tr>
              <td style="padding:26px 44px;background-color:#f7f6ff;border-top:1px solid #ecebfb;text-align:center;">
                <div style="margin-bottom:12px;">
                  <a href="${this.appUrl}" style="color:#7c3aed;text-decoration:none;font-size:13px;font-weight:600;margin:0 12px;">Browse the marketplace</a>
                  <span style="color:#c7bdf5;">&bull;</span>
                  <a href="${this.appUrl}/api/docs" style="color:#7c3aed;text-decoration:none;font-size:13px;font-weight:600;margin:0 12px;">Help &amp; API</a>
                </div>
                <div style="font-size:12px;color:#a099c0;line-height:1.7;">
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
    return `<p style="margin:0 0 16px 0;font-size:16px;line-height:1.65;color:#514b6b;">${text}</p>`;
  }

  private button(label: string, href: string): string {
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px auto;">
      <tr>
        <td style="border-radius:12px;background-color:#7c3aed;background-image:${this.gradient};box-shadow:0 8px 20px rgba(124,58,237,0.35);">
          <a href="${href}" style="display:inline-block;padding:15px 40px;font-family:${this.font};font-size:16px;font-weight:700;letter-spacing:0.3px;color:#ffffff;text-decoration:none;">${label}</a>
        </td>
      </tr>
    </table>`;
  }

  private tokenBox(label: string, token: string): string {
    return `<div style="margin:22px 0;padding:20px;background-color:#f5f3ff;border:1px dashed #c4b5fd;border-radius:14px;text-align:center;">
      <div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#a78bfa;margin-bottom:10px;font-weight:600;">${label}</div>
      <div style="font-family:'SF Mono','Courier New',monospace;font-size:18px;font-weight:700;letter-spacing:2px;color:#6d28d9;word-break:break-all;">${token}</div>
    </div>`;
  }

  private fallbackLink(href: string): string {
    return `<p style="margin:6px 0 0 0;font-size:13px;line-height:1.6;color:#a099c0;">If the button does not work, copy and paste this link into your browser:<br /><a href="${href}" style="color:#7c3aed;word-break:break-all;">${href}</a></p>`;
  }

  private detailRow(label: string, value: string): string {
    return `<tr>
      <td style="padding:12px 0;border-bottom:1px solid #efedfb;font-size:14px;color:#a099c0;">${label}</td>
      <td style="padding:12px 0;border-bottom:1px solid #efedfb;font-size:15px;font-weight:700;color:#1e1b4b;text-align:right;">${value}</td>
    </tr>`;
  }

  private detailTable(rows: string): string {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0 22px 0;background-color:#faf9ff;border-radius:14px;padding:4px 20px;">${rows}</table>`;
  }

  sendVerificationEmail(to: string, token: string) {
    const link = `${this.appUrl}/verify-email?token=${encodeURIComponent(token)}`;
    const inner =
      this.paragraph('Welcome to Antiqo! One quick step to confirm it is you.') +
      this.paragraph('Tap the button below to verify your email address. This link stays valid for 24 hours.') +
      this.button('Verify my email', link) +
      this.tokenBox('Or use this verification token', token) +
      this.fallbackLink(link) +
      this.paragraph('If you did not create an Antiqo account, you can safely ignore this message.');
    return this.send(
      to,
      'Verify your Antiqo email',
      this.layout('Confirm your email', inner),
    );
  }

  sendPasswordResetEmail(to: string, token: string) {
    const link = `${this.appUrl}/reset-password?token=${encodeURIComponent(token)}`;
    const inner =
      this.paragraph('We received a request to reset the password on your Antiqo account.') +
      this.paragraph('Tap the button below to choose a new password. For your security, this link expires in 1 hour.') +
      this.button('Reset my password', link) +
      this.tokenBox('Or use this reset token', token) +
      this.fallbackLink(link) +
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
      this.button('Start exploring', this.appUrl) +
      this.paragraph('Happy hunting for timeless finds.');
    return this.send(
      to,
      'Welcome to Antiqo',
      this.layout('Welcome aboard', inner),
    );
  }

  sendOrderConfirmation(to: string, orderId: number, total: string) {
    const link = `${this.appUrl}/orders/${orderId}`;
    const inner =
      this.paragraph('Thanks for shopping with Antiqo — your order is confirmed.') +
      this.detailTable(
        this.detailRow('Order number', `#${orderId}`) +
          this.detailRow('Order total', total) +
          this.detailRow('Status', 'Placed'),
      ) +
      this.button('View your order', link) +
      this.paragraph('We will email you with each update as your order moves along.');
    return this.send(
      to,
      `Your Antiqo order #${orderId}`,
      this.layout('Order confirmed', inner),
    );
  }

  sendReturnUpdate(to: string, returnId: number, status: string) {
    const link = `${this.appUrl}/returns/${returnId}`;
    const inner =
      this.paragraph('There is an update on your Antiqo return request.') +
      this.detailTable(
        this.detailRow('Return number', `#${returnId}`) +
          this.detailRow('Current status', status),
      ) +
      this.button('View return details', link) +
      this.paragraph('We will keep you posted as the return progresses.');
    return this.send(
      to,
      `Your Antiqo return #${returnId}`,
      this.layout('Return update', inner),
    );
  }
}
