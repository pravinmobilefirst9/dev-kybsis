import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { PrismaService } from 'src/prisma.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports : [
    ScheduleModule.forRoot()
  ],
  controllers: [TransactionController],
  providers: [TransactionService, PrismaService],
  exports : [TransactionService]
})
export class TransactionModule {}
