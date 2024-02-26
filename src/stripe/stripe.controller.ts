import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { AuthGuard } from 'src/guards/auth.guard';
import RequestWithRawBody from 'src/middlewares/interfaces/requestWithRawBody.interface';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

 @Get('get_subscription_plans')
  async fetchAllProducts(){
    return await this.stripeService.fetchAllSubscriptionPlans();
  }

  @Post('create_subscription/:priceId')
  @UseGuards(AuthGuard)
  async createSubscription(@Req() req : any, @Param('priceId') priceId : string) {
    const {user_id} = req.auth;
    return await this.stripeService.createSubscription(user_id, priceId);
  }
 
  @Post('create_session/:priceId')
  @UseGuards(AuthGuard)
  async createSesion(@Req() req : any, @Param('priceId') priceId : string) {
    const {user_id} = req.auth;
    return await this.stripeService.createSession(user_id, priceId);
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
