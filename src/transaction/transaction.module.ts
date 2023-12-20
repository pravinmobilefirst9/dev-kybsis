import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { PrismaService } from 'src/prisma.service';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

@Module({
  imports : [],
  controllers: [TransactionController],
  providers: [TransactionService, PrismaService],
})
export class TransactionModule {}
