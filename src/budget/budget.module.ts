import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [BudgetController],
  providers: [BudgetService, PrismaService, UsersService],
})
export class BudgetModule {}
