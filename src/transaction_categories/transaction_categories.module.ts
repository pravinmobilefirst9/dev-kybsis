import { Module } from '@nestjs/common';
import { TransactionCategoriesService } from './transaction_categories.service';
import { TransactionCategoriesController } from './transaction_categories.controller';
import { PrismaService } from 'src/prisma.service';
import { TransactionService } from 'src/transaction/transaction.service';

@Module({
  controllers: [TransactionCategoriesController],
  providers: [TransactionCategoriesService, PrismaService, TransactionService],
})
export class TransactionCategoriesModule {}
