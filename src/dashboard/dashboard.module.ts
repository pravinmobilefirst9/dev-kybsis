import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaService } from 'src/prisma.service';
import { InvestmentService } from 'src/investment/investment.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { AssetsService } from 'src/assets/assets.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, PrismaService, InvestmentService, TransactionService, AssetsService],
})
export class DashboardModule {}
