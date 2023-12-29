import { IsString, IsNotEmpty, IsNumber, IsPositive, IsIn, IsInt } from 'class-validator';

export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
  }
  
export class CreatePaymentDto {
  @IsNotEmpty({ message: 'Subscription ID is required' })
  @IsInt({message : 'Subscription ID should be number'})
  subscriptionId: number;

  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be a positive number' })
  amount: number;

  @IsString({ message: 'Currency must be a string' })
  @IsNotEmpty({ message: 'Currency is required' })
  currency: string;

  @IsString({ message: 'Transaction Id must be a string' })
  @IsNotEmpty({ message: 'Transaction Id is required' })
  transactionId: string;

  @IsString({ message: 'Payment method must be a string' })
  @IsNotEmpty({ message: 'Payment method is required' })
//   @IsIn(['credit_card', 'paypal'], { message: 'Invalid payment method. Must be credit_card or paypal' })
  paymentMethod: string;

  paymentStatus: PaymentStatus

}
