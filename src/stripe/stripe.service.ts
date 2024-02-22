import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from 'src/prisma.service';
import { ResponseReturnType } from 'src/common/responseType';
import { User } from '@prisma/client';

@Injectable()
export class StripeService {

  private readonly stripe: Stripe;

  constructor(
    public readonly prisma: PrismaService
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2023-10-16',
    });
  }

  async fetchAllSubscriptionPlans() : Promise<ResponseReturnType>{
    try {
      console.log("Fetch subscription")
      const products = await this.stripe.products.list({
        active: true,
        expand: ['data.default_price']
      });

      return {
        success : true,
        message : "Subscription plans fetched successfully",
        statusCode : HttpStatus.OK,
        data : products.data
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)   
    }
  }

  async createStripeCustomer(user : User) : Promise<ResponseReturnType> {
    try {
     // Create stripe customer
      const stripeCustomer = await this.stripe.customers.create({
        email : user.email
      })

      return {
        success : true,
        message : "Stripe customer created successfully",
        statusCode : HttpStatus.CREATED,
        data : stripeCustomer
      };      
      
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async createSubscription(user_id : number, priceId : string){
    try {
      const user = await this.prisma.user.findUnique({where : {id : user_id}})

      // Checks


      // Basic Flow

      //  1) Create Customer
      const customerData = await this.createStripeCustomer(user);
      const customerId = customerData['data']['id'];

      // 2) Create a subscription
      const subscription : any = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: priceId,
        }],
        collection_method : 'charge_automatically',
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });
      
      // Create subscription in DB
      // const newSubscription = await this.prisma.subscription.create({
      //   data : {
      //     stripeCustomerId : customerId,
      //     stripeSubscriptionId : subscription.id,
      //     user : {connect : {id : user_id}},
      //     subscriptionStatus : "INACTIVE",
      //     invoiceStatus : "OPEN"
      //   }
      // })
      console.log({subscription});
      
      return {
        success : true,
        message : "Subscription added successfully",
        statusCode : HttpStatus.CREATED,
        data : {
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice.payment_intent.client_secret,
          // newSubscription
        }
      };  

    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }


  async constructEventFromPayload(signature: string, payload: Buffer) : Promise<Stripe.Event> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
 
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
  }

  async handleSubscriptionEvent(event : Stripe.Event){
    console.log("Event type : ",event.type)
    console.log("Event data : ",event.data.object)
    switch (event.type) {
      case 'invoice.paid':
        const data = event.data.object
        console.log({data});
        
        // Used to provision services after the trial has ended.
        // The status of the invoice will show up as paid. Store the status in your
        // database to reference when a user accesses your service to avoid hitting rate limits.
        break;
      case 'invoice.payment_failed':
        // If the payment fails or the customer does not have a valid payment method,
        //  an invoice.payment_failed event is sent, the subscription becomes past_due.
        // Use this webhook to notify your user that their payment has
        // failed and to retrieve new card details.
        break;
      case 'customer.subscription.deleted':
        if (event.request != null) {
          // handle a subscription canceled by your request
          // from above.
        } else {
          // handle subscription canceled automatically based
          // upon your subscription settings.
        }
        break;
        case 'payment_intent.succeeded':
          const paymentMethod = event.data.object;
          // Then define and call a function to handle the event payment_intent.succeeded
          break;
      default:
      // Unexpected event type
    }

  }

}
