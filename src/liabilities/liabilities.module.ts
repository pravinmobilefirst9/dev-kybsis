import { Module } from '@nestjs/common';
import { LiabilitiesService } from './liabilities.service';
import { LiabilitiesController } from './liabilities.controller';
import { PrismaService } from 'src/prisma.service';
import { TransactionService } from 'src/transaction/transaction.service';

@Module({
  controllers: [LiabilitiesController],
  providers: [LiabilitiesService, PrismaService, TransactionService],
})
export class LiabilitiesModule {}
