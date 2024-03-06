import { Module } from '@nestjs/common';
import { LiabilitiesService } from './liabilities.service';
import { LiabilitiesController } from './liabilities.controller';
import { PrismaService } from 'src/prisma.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports : [
    ScheduleModule.forRoot()
  ],
  controllers: [LiabilitiesController],
  providers: [LiabilitiesService, PrismaService, TransactionService],
  exports : [LiabilitiesService]
})
export class LiabilitiesModule {}
