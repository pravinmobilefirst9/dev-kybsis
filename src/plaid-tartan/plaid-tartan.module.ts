import { Module } from '@nestjs/common';
import { PlaidTartanService } from './plaid-tartan.service';
import { PlaidTartanController } from './plaid-tartan.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [PlaidTartanController],
  providers: [PlaidTartanService, PrismaService],
})
export class PlaidTartanModule {}
