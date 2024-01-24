import { Module } from '@nestjs/common';
import { AccountForcastingService } from './account_forcasting.service';
import { AccountForcastingController } from './account_forcasting.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [AccountForcastingController],
  providers: [AccountForcastingService, PrismaService],
})
export class AccountForcastingModule {}
