import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma.service';
import { TransactionsController } from './transactions/transactions.controller';
import { PlaidTartanModule } from './plaid-tartan/plaid-tartan.module';

@Module({
  imports: [UsersModule, PlaidTartanModule],
  controllers: [AppController, TransactionsController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
