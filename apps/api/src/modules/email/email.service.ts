import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { User } from '../core/entities/user.entity';

@Injectable()
export class EmailService {
  constructor() {}

  async sendEmail(sendEmailDto: any): Promise<{ message: string }> {
    const { to, subject, text, html } = sendEmailDto;

    // Create transporter (in production, use configured SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'AFYA-C <noreply@afya-c.com>',
        to,
        subject,
        text,
        html,
      });

      return { message: 'Email sent successfully' };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendBulkEmails(
    bulkEmailDto: any,
    user: User
  ): Promise<{ message: string; sent: number; failed: number }> {
    const { recipients, subject, template, data } = bulkEmailDto;
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        await this.sendEmail({
          to: recipient,
          subject,
          text: this.renderTemplate(template, data),
          html: this.renderTemplate(template, data),
        });
        sent++;
      } catch (error) {
        failed++;
      }
    }

    return {
      message: `Sent ${sent} emails, ${failed} failed`,
      sent,
      failed,
    };
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const subject = 'Password Reset Request - AFYA-C';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      </div>
    `;

    await this.sendEmail({ to, subject, html });
  }

  async sendAppointmentReminder(
    to: string,
    patientName: string,
    appointmentDate: Date,
    doctorName: string,
    appointmentLink?: string
  ): Promise<void> {
    const subject = 'Appointment Reminder - AFYA-C';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Appointment Reminder</h2>
        <p>Dear ${patientName},</p>
        <p>You have an upcoming appointment:</p>
        <ul>
          <li><strong>Date:</strong> ${appointmentDate.toLocaleDateString()}</li>
          <li><strong>Doctor:</strong> ${doctorName}</li>
          ${appointmentLink ? `<li><strong>Video Link:</strong> <a href="${appointmentLink}">Join Consultation</a></li>` : ''}
        </ul>
        <p>Please arrive 10 minutes before your scheduled time.</p>
      </div>
    `;

    await this.sendEmail({ to, subject, html });
  }

  async sendLabResultNotification(
    to: string,
    patientName: string,
    testName: string,
    resultStatus: string
  ): Promise<void> {
    const subject = 'Lab Results Available - AFYA-C';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Lab Results Available</h2>
        <p>Dear ${patientName},</p>
        <p>Your lab results for <strong>${testName}</strong> are now available.</p>
        <p>Status: <strong>${resultStatus}</strong></p>
        <p>Please log in to your patient portal to view the results or contact your healthcare provider.</p>
      </div>
    `;

    await this.sendEmail({ to, subject, html });
  }

  async sendPaymentReceipt(
    to: string,
    patientName: string,
    receiptNumber: string,
    amount: number,
    currency: string
  ): Promise<void> {
    const subject = `Payment Receipt - ${receiptNumber}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Receipt</h2>
        <p>Dear ${patientName},</p>
        <p>Thank you for your payment.</p>
        <ul>
          <li><strong>Receipt Number:</strong> ${receiptNumber}</li>
          <li><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</li>
          <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
        </ul>
        <p>Please keep this receipt for your records.</p>
      </div>
    `;

    await this.sendEmail({ to, subject, html });
  }

  async createTemplate(templateDto: any, user: User): Promise<{ message: string }> {
    // In a real implementation, this would store templates in the database
    // For now, we'll just return a success message
    return { message: `Template '${templateDto.name}' created successfully` };
  }

  private renderTemplate(template: string, data: any): string {
    // Simple template rendering
    let rendered = template;
    for (const [key, value] of Object.entries(data)) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    return rendered;
  }
}
