import { Module } from '@nestjs/common';
import { EventEmittorsService } from './event-emittors.service';
import { LiabilitiesService } from 'src/liabilities/liabilities.service';
import { AssetsService } from 'src/assets/assets.service';
import { PlaidTartanService } from 'src/plaid-tartan/plaid-tartan.service';
import { PrismaService } from 'src/prisma.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { InvestmentService } from 'src/investment/investment.service';

@Module({
  controllers: [],
  providers: [EventEmittorsService,LiabilitiesService, AssetsService, PlaidTartanService, PrismaService, TransactionService, FirebaseService, InvestmentService],

})
export class EventEmittorsModule {}
