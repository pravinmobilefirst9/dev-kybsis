import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { PrismaService } from 'src/prisma.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports : [
    ScheduleModule.forRoot()
  ],
  controllers: [AssetsController],
  providers: [AssetsService, PrismaService, TransactionService],
  exports : [AssetsService]
})
export class AssetsModule {}
