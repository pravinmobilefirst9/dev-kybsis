import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [BudgetController],
  providers: [BudgetService, PrismaService],
})
export class BudgetModule {}
