import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  controllers: [BudgetController],
  providers: [BudgetService, PrismaService, UsersService, FirebaseService],
})
export class BudgetModule {}
