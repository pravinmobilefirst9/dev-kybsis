import { Module } from '@nestjs/common';
import { PlaidTartanService } from './plaid-tartan.service';
import { PlaidTartanController } from './plaid-tartan.controller';
import { PrismaService } from 'src/prisma.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  imports : [],
  controllers: [PlaidTartanController],
  providers: [PlaidTartanService, PrismaService, TransactionService,FirebaseService],
})
export class PlaidTartanModule {}
