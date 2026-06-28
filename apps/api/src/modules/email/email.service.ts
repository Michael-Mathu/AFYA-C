import { Injectable } from '@nestjs/common';
import { User } from '../../core/entities/user.entity';

@Injectable()
export class EmailService {
  constructor() {}

  async sendEmail(sendEmailDto: any): Promise<{ message: string }> {
    const { to, subject, text, html } = sendEmailDto;
    // ponytail: just log emails to console to avoid nodemailer/mailer dependencies in Phase 1 dev
    console.log(`✉️ [Mock Email] Sending to: ${to}`);
    console.log(`✉️ Subject: ${subject}`);
    console.log(`✉️ Content: ${text || html}`);
    return { message: 'Email sent successfully (mocked)' };
  }

  async sendBulkEmails(
    bulkEmailDto: any,
    user: User
  ): Promise<{ message: string; sent: number; failed: number }> {
    const { recipients, subject, template, data } = bulkEmailDto;
    let sent = 0;
    
    for (const recipient of recipients) {
      await this.sendEmail({
        to: recipient,
        subject,
        text: this.renderTemplate(template, data),
      });
      sent++;
    }

    return {
      message: `Sent ${sent} emails (mocked)`,
      sent,
      failed: 0,
    };
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Password Reset Request - AFYA-C',
      text: `Reset your password here: ${resetLink}`,
    });
  }

  async sendAppointmentReminder(
    to: string,
    patientName: string,
    appointmentDate: Date,
    doctorName: string,
    appointmentLink?: string
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Appointment Reminder - AFYA-C',
      text: `Dear ${patientName}, reminder for appointment with ${doctorName} on ${appointmentDate.toLocaleDateString()}` + (appointmentLink ? `. Link: ${appointmentLink}` : ''),
    });
  }

  async sendLabResultNotification(
    to: string,
    patientName: string,
    testName: string,
    resultStatus: string
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Lab Results Available - AFYA-C',
      text: `Dear ${patientName}, lab results for ${testName} are available. Status: ${resultStatus}`,
    });
  }

  async sendPaymentReceipt(
    to: string,
    patientName: string,
    receiptNumber: string,
    amount: number,
    currency: string
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Payment Receipt - ${receiptNumber}`,
      text: `Dear ${patientName}, thank you for payment of ${currency} ${amount.toFixed(2)}`,
    });
  }

  async createTemplate(templateDto: any, user: User): Promise<{ message: string }> {
    return { message: `Template '${templateDto.name}' created successfully` };
  }

  private renderTemplate(template: string, data: any): string {
    let rendered = template;
    for (const [key, value] of Object.entries(data)) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    return rendered;
  }
}
