import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as nodeMailer from 'nodemailer';
import { UserCreatedEventPayload } from './types/user-created.event';
import { LiabilitiesService } from 'src/liabilities/liabilities.service';
import { AssetsService } from 'src/assets/assets.service';
import { PlaidTartanService } from 'src/plaid-tartan/plaid-tartan.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { InvestmentService } from 'src/investment/investment.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class EventEmittorsService {
  constructor(
    private liabilitiesService: LiabilitiesService,
    private assetsService: AssetsService,
    private plaidTartenService: PlaidTartanService,
    private investmentService: InvestmentService,
    private firebaseServices : FirebaseService,
    private prismaService : PrismaService
  ){}

  @OnEvent("user.created",{async : true})
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


  @OnEvent("plaid.registered",{async : true})
  async onPlaidAccountRegistered(user_id : number){
    await this.plaidTartenService.syncHistoricalTransactions(user_id)
    await this.liabilitiesService.importLiabilities(user_id)
    await this.assetsService.createAssetReportToken(user_id)
    await this.assetsService.importAssetReports(user_id)
    await this.investmentService.syncInvestmentHoldingDetails(user_id)
  }

  @OnEvent("manualInvestment.updated", {async : true})
  async manualInvestmentUpdated(user_id : number){
    const allManualInvestments = await this.prismaService.manualInvestments.findMany({
      where : {
        user_id
      },
      select : {
        id : true,
        investmentCategory : {
          select : {
            id : true,
            name : true,
            fields : true
          }
        },
        account_id : true,
        Institution : {
          select : {
            ins_id : true,
            ins_name : true
          }
        },
        data : true,
        created_at : true
      }
    })
    
    const {total_investment} = await this.investmentService.totalOfManualInvestment(allManualInvestments);

    // Create a date of first day of month to have consistency
    const now = new Date();
    const firstDayOfMonth = await this.investmentService.setToFirstDayOfMonth(new Date(now))
    const investmentTotal = await this.prismaService.totalInvestments.findFirst({
      where: {
        userId: user_id,
        monthYear: firstDayOfMonth
      }
    })

    if (investmentTotal) {
      await this.prismaService.totalInvestments.updateMany({
        where: { userId: user_id, monthYear: firstDayOfMonth },
        data: { totalManualInvestment : total_investment }
      })
    }
    else {
      await this.prismaService.totalInvestments.create({
        data: {
          userId: user_id,
          totalPlaidInvestment: 0,
          totalManualInvestment : total_investment,
          monthYear: firstDayOfMonth,
        }
      })
    }
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

    if (user.email !== undefined && user.email !== null) {
      // send Push Notification
      const welcomeTitle = 'Welcome to Kybsis!';
      const welcomeBody = 'Thank you for registering. OTP has been sent successfully to your Email!';
      const deviceToken = user.device_token
      await this.firebaseServices.sendPushNotification(deviceToken, welcomeTitle, welcomeBody);
    }
  }

  

async formatDate(date : Date) {
    const options : any = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
}

}
