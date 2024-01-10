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

@Module({
  imports: [UsersModule, PlaidTartanModule, TransactionModule, InvestmentModule, TransactionCategoriesModule, AssetsModule, LiabilitiesModule, PaymentModule, SubscriptionModule, BudgetModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, AuthGuard,],
})
export class AppModule {}
