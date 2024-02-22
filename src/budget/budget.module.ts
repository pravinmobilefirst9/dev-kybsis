import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';
import { StripeService } from 'src/stripe/stripe.service';

@Module({
  controllers: [BudgetController],
  providers: [BudgetService, PrismaService, UsersService,StripeService],
})
export class BudgetModule {}
