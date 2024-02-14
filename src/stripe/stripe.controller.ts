import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreateStripeDto } from './dto/create-stripe.dto';
import { UpdateStripeDto } from './dto/update-stripe.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import RequestWithRawBody from 'src/middlewares/interfaces/requestWithRawBody.interface';
import { HttpService } from '@nestjs/axios';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

 @Post('get_subscription_plans')
  async fetchAllProducts(){
    return await this.stripeService.fetchAllSubscriptionPlans();
  }

  @Post('create_subscription/:priceId')
  @UseGuards(AuthGuard)
  async createSubscription(@Req() req : any, @Param('priceId') priceId : string) {
    const {user_id} = req.auth;
    return await this.stripeService.createSubscription(user_id, priceId);
  }

  @Post('webhook')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RequestWithRawBody
  ) { 
    if (!signature) {
      throw new HttpException('Missing stripe-signature header', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    const event = await this.stripeService.constructEventFromPayload(signature, request.rawBody);
    // Process the webhook event
    await this.stripeService.handleSubscriptionEvent(event);
  }
}
