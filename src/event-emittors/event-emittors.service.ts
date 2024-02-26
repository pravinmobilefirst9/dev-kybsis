import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from '@prisma/client';
import * as nodeMailer from 'nodemailer';
import { UserCreatedEventPayload } from './types/user-created.event';
import { UserSubscriptionInvoicePayload } from './types/user-invoice-paid.event';
import { UserSubscriptionDeleted } from './types/user-subscription-deleted.event';

@Injectable()
export class EventEmittorsService {

  @OnEvent("subscription.invoice.paid")
  async onSubscriptionGet({user, subscription} : UserSubscriptionInvoicePayload){
    await this.sendEmail(
      user,
      'Your Kybsis App Subscription Purchase Confirmation 🚀',
      `
      Dear sir/madam,

      Thank you for choosing Kybsis to streamline your productivity and empower your workflow! We're excited to confirm your recent subscription purchase. Below are the details of your subscription:
      
      Subscription Plan: ${user.user_role}
      Subscription Duration: ${await this.formatDate(new Date(subscription.currentPeriodStart)) } - ${await this.formatDate(new Date(subscription.currentPeriodEnd)) }
      Your subscription ID : ${subscription.id}
      Price: ${subscription.amount / 100} $
      
      You can enjoy uninterrupted access to all premium features and content during this period.
      
      To view and manage your subscription details, including invoices, payment history, and renewal options, please visit your account settings here.
      
      If you have any questions or need assistance, feel free to reach out to our support team at support@kybsis.com. We're here to help!
      
      Thank you for being a valued Kybsis user. We look forward to serving you and providing you with an exceptional experience.
      
      Best regards,
      Kybsis Team
      
      Invoice Link: ${subscription.invoiceUrl}
      `
    )
  }

  @OnEvent("user.subscription.deleted")
  async onUserSubscriptionEnded({user} : UserSubscriptionDeleted){
    await this.sendEmail(
      user,
      "Your Kybsis App Subscription Has Ended",
      `
      We hope this message finds you well. We wanted to remind you that your ${user.user_role.toLowerCase()} subscription to Kybsis has ended.

      Best regards,
      Kybsis Team
      `
    )
  }

  @OnEvent("user.created")
  async onUserRegistered({otp, user} : UserCreatedEventPayload){

    await this.sendEmail(
      user,
      'Welcome and verify your email.',
      `Thank you for joining Kybsis! We're excited to have you on board.
      
      To complete your signup, please verify your email address by entering the following code in the app:
      
      Verification Code: ${otp}
      
      This code will expire in 10 minutes.
      
      If you didn't request this code, please ignore this email.
      
      We're looking forward to seeing you in the app!
      
      Sincerely,
      The Kybsis Team`,
      otp,
    );
  }












  async sendEmail(user: any, subject: string, message: string, otp?: number) {
    const transporter = nodeMailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      // secure: true, // Convert to boolean if needed
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const emailOptions = {
      from: process.env.FROM_EMAIL,
      to: user.email !== undefined && user.email !== null ? user.email : user,
      subject: subject,
      text: message,
    };

    // emailOptions.text += ' Your Notification Code is : ' + otp;

    await transporter.sendMail(emailOptions);
  }

  

async formatDate(date : Date) {
    const options : any = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
}

}
