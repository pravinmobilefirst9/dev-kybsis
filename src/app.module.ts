import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma.service';
import { PlaidTartanModule } from './plaid-tartan/plaid-tartan.module';
import { TransactionModule } from './transaction/transaction.module';
import { AuthGuard } from './guards/auth.guard';
import { InvestmentModule } from './investment/investment.module';
import { TransactionCategoriesModule } from './transaction_categories/transaction_categories.module';
import { AssetsModule } from './assets/assets.module';
import { LiabilitiesModule } from './liabilities/liabilities.module';
import { PaymentModule } from './payment/payment.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { BudgetModule } from './budget/budget.module';
import { AccountForcastingModule } from './account_forcasting/account_forcasting.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { StripeModule } from './stripe/stripe.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventEmittorsModule } from './event-emittors/event-emittors.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    UsersModule, PlaidTartanModule, TransactionModule, InvestmentModule, TransactionCategoriesModule, AssetsModule, LiabilitiesModule, PaymentModule, SubscriptionModule, BudgetModule, AccountForcastingModule, DashboardModule, StripeModule, EventEmittorsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, AuthGuard,],
})
export class AppModule { }
