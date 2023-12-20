import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma.service';
import { PlaidTartanModule } from './plaid-tartan/plaid-tartan.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [UsersModule, PlaidTartanModule, TransactionModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
