import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from 'src/prisma.service';
import { ResponseReturnType } from 'src/common/responseType';
import { User } from '@prisma/client';


const  ProductIdWithRole = {
  prod_PbPAM3TNohple7 : "PREMIUM",
  prod_PbPAaKx3F2jl88 : "BASIC"
}

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
        email : user.email,
        metadata : {
          user_id : user.id
        }
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

      // 1) Create a subscription
      const subscription : any = await this.stripe.subscriptions.create({
        customer: user.stripe_customer_id,
        items: [{
          price: priceId,
        }],
        collection_method : 'charge_automatically',
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });
      
      // Create subscription in DB
      await this.prisma.subscription.create({
        data : {
          stripeCustomerId : user.stripe_customer_id,
          stripeSubscriptionId : subscription.id,
          invoiceId : subscription.latest_invoice.id,
          user : {connect : {id : user_id}},
          subscriptionStatus : "INACTIVE",
          invoiceStatus : "OPEN",
          amount : subscription.plan.amount,
          currency : subscription.plan.currency,
          interval : subscription.plan.interval,
          interval_count : 1,
          priceId : subscription.plan.id,
          product : subscription.plan.product
        }
      })     
      
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


  async handleSubscriptionEvent(event : any){
    console.log("Event type : ",event.type)
    console.log("Event data : ",event.data.object)
    const data = event.data.object;
    switch (event.type) {
      case 'invoice.payment_failed':
        // If the payment fails or the customer does not have a valid payment method,
        //  an invoice.payment_failed event is sent, the subscription becomes past_due.
        // Use this webhook to notify your user that their payment has
        // failed and to retrieve new card details.
        break;
      case 'invoice.payment_succeeded' || 'invoice.paid':
        const {subscription, customer_email} = data
        const user = await this.prisma.user.findFirst({
          where : {
            email : customer_email
          }
        });

        const futureDate = await this.getDateThirtyDaysAfterToday();
        const updatedSubscription = await this.prisma.subscription.update({
          where : {
            stripeSubscriptionId : subscription
          },
          data : {
            subscriptionStatus : "ACTIVE",
            invoiceStatus : "PAID",
             currentPeriodStart : new Date(),
             currentPeriodEnd : futureDate           
          }
        });

        
        await this.prisma.user.update({
          data : {
            current_subscription_id : updatedSubscription.id,
            user_role : ProductIdWithRole[`${updatedSubscription['product']}`]
          },
          where : {
            id : user.id
          }
        });
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

  async getDateThirtyDaysAfterToday() {
    const today = new Date();
    // Add 30 days to today's date
    const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return futureDate;
  }
    
  
}
