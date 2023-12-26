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

@Module({
  imports: [UsersModule, PlaidTartanModule, TransactionModule, InvestmentModule, TransactionCategoriesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, AuthGuard],
})
export class AppModule {}
