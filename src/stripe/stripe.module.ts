import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [StripeController],
  providers: [StripeService,PrismaService],
})
export class StripeModule {}
