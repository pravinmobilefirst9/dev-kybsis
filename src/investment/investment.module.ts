import { Module } from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { InvestmentController } from './investment.controller';
import { PrismaService } from 'src/prisma.service';
import { TransactionService } from 'src/transaction/transaction.service';

@Module({
  controllers: [InvestmentController],
  providers: [InvestmentService, PrismaService, TransactionService],
})
export class InvestmentModule {}
