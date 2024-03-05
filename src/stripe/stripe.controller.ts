import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { AuthGuard } from 'src/guards/auth.guard';
import RequestWithRawBody from 'src/middlewares/interfaces/requestWithRawBody.interface';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}
}
