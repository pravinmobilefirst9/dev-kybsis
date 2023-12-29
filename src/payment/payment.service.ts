import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePaymentDto, PaymentStatus } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prismaService : PrismaService
  ){}
  async createPayment(paymentData : CreatePaymentDto, user_id : number){
    try {
      const user = await this.prismaService.user.findUnique({
        where : {
          id : user_id
        }
      })

      if (!user) {
        throw new HttpException(
          "User not found",
          HttpStatus.NOT_FOUND
        );
      }

      if (paymentData.paymentStatus !== PaymentStatus.COMPLETED) {
        throw new HttpException('Payment failed', HttpStatus.BAD_REQUEST);
      }

      const isSubscriptionValid = await this.prismaService.subscriptions.findUnique(
        {
          where : {
            id : paymentData.subscriptionId
          }
        }
      )

      if (!isSubscriptionValid) {
        throw new HttpException(
          "Subscription is not valid",
          HttpStatus.BAD_REQUEST
        )
      }

      const newPayment = await this.prismaService.payment.create({
        data : {
          userId : user_id,
          amount : paymentData.amount,
          currency : paymentData.currency,
          paymentMethod : paymentData.paymentMethod,
          subscriptionId : paymentData.subscriptionId,
          transactionId : paymentData.transactionId,
          status : paymentData.paymentStatus
        }
      })

      const newSubscription = await this.prismaService.userSubscription.create({
        data : {
          user_id : user_id,
          subscription_id : paymentData.subscriptionId,
        }
      })  
      
      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        data : {
          subscription : newSubscription,
          payment : newPayment
        },
        message: "Subscription Successfull"
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }






  create(createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
