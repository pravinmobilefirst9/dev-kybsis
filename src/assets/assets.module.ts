import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { PrismaService } from 'src/prisma.service';
import { TransactionService } from 'src/transaction/transaction.service';

@Module({
  controllers: [AssetsController],
  providers: [AssetsService, PrismaService, TransactionService],
})
export class AssetsModule {}
