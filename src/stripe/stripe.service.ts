import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from 'src/prisma.service';
import { ResponseReturnType } from 'src/common/responseType';
import { User } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserSubscriptionInvoicePayload } from 'src/event-emittors/types/user-invoice-paid.event';
import { UserSubscriptionDeleted } from 'src/event-emittors/types/user-subscription-deleted.event';


const  ProductIdWithRole = {
  prod_PbPAM3TNohple7 : "PREMIUM",
  prod_PbPAaKx3F2jl88 : "BASIC"
}

@Injectable()
export class StripeService {

  private readonly stripe: Stripe;

  constructor(
    public readonly prisma: PrismaService,
    private eventEmitter : EventEmitter2
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

  async createSession(user_id : number, priceId : string){
    try {
      let user = await this.prisma.user.findUnique({where : {id : user_id}})
      if (!user.stripe_customer_id) {
        const stripeCustomer = await this.stripe.customers.create({
          email : user.email,
          metadata : {
            user_id : user.id
          }
        })

        user = await this.prisma.user.update({
          where : {
            id : user.id
          },data : {
            stripe_customer_id : stripeCustomer.id
          }
        })
      }
      
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: user.stripe_customer_id,
        line_items: [
          {
            price: priceId,
            // For metered billing, do not pass quantity
            quantity: 1,
          },
          
        ],
        // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
        // the actual Session ID is returned in the query parameter when your customer
        // is redirected to the success page.
        success_url: 'https://example.com/success.html?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://example.com/canceled.html',
      });

      return session;
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
    // console.log("Event data : ",event.data.object)
    const data = event.data.object;
    console.log({data});
    
    switch (event.type) {

      case 'checkout.session.completed':
        console.log(event.type);
      
      case 'invoice.payment_succeeded' || 'invoice.paid':
        console.log(event.type);
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
             currentPeriodEnd : futureDate,
             invoiceUrl : subscription.invoice_pdf          
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

        this.eventEmitter.emit("subscription.invoice.paid", new UserSubscriptionInvoicePayload(user, updatedSubscription));
        break;
      case 'customer.subscription.deleted':
        console.log(event.type);
        const subscriptionExists = await this.prisma.subscription.findUnique({
          where : {
            stripeSubscriptionId : data.id
          }
        });

        const subscriptionUser = await this.prisma.user.findFirst({
          where : {
            stripe_customer_id : data.customer
          }
        })

        if (subscriptionExists && subscriptionUser && 
          subscriptionExists.id === subscriptionUser.current_subscription_id) {
          await this.prisma.user.update({
            data : {
              user_role : "FREE"
            },
            where : {
              id : subscriptionUser.id
            }
          })
        }

        this.eventEmitter.emit("user.subscription.deleted", new UserSubscriptionDeleted(user, subscription));
        if (event.request != null) {    
          // handle a subscription canceled by your request
          // from above.
        } else {
          // handle subscription canceled automatically based
          // upon your subscription settings.
        }
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
