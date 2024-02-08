// account.dto.ts

import { IsInt, IsString, IsOptional, IsBoolean, IsDate, ValidateNested, IsNotEmpty, IsNumber, IsPositive, IsEnum } from 'class-validator';
enum CurrencyCode {
    INR = 'INR',
    USD = 'USD',
    EUR = 'EUR',
    GBP = 'GBP',
    JPY = 'JPY',
    AUD = 'AUD',
    CAD = 'CAD',
    CHF = 'CHF',
    CNY = 'CNY',
    SEK = 'SEK',
    NZD = 'NZD',
  }

  enum PlaidAccountType {
    CHECKING = 'checking',
    SAVINGS = 'savings',
    CREDIT_CARD = 'credit card',
    INVESTMENT = 'investment',
    LOAN = 'loan',
    MORTGAGE = 'mortgage',
    OTHER = 'other'
  }
  
  export default PlaidAccountType;
  
export class ManualAccountDTO {
  @IsNotEmpty({ message: 'Account name must not be empty' })
  @IsString({ message: 'Account name must be a string' })
  accountName: string;

  @IsNotEmpty({ message: 'Institution name must not be empty' })
  @IsString({ message: 'Institution name must be a string' })
  institutionName: string;

  @IsNotEmpty({ message: 'Institution ID must not be empty' })
  @IsString({ message: 'Institution ID must be a string' })
  institutionId: string;

  @IsNotEmpty({ message: 'Account ID must not be empty' })
  @IsString({ message: 'Account ID must be a string' })
  accountId: string;

  @IsNotEmpty({ message: 'type must not be empty' })
  @IsString({ message: 'type must be a string' })
  @IsEnum(PlaidAccountType, { message: 'Invalid type' })
  type: string;

  @IsNotEmpty({ message: 'Current balance must not be empty' })
  @IsNumber({}, { message: 'Current balance must be a number' })
  @IsPositive({ message: 'Current balance must be a positive number' })
  currentBalance: number;

  @IsNotEmpty({ message: 'Available balance must not be empty' })
  @IsNumber({}, { message: 'Available balance must be a number' })
  @IsPositive({ message: 'Available balance must be a positive number' })
  availableBalance: number;

  @IsNotEmpty({ message: 'ISO currency code must not be empty' })
  @IsString({ message: 'ISO currency code must be a string' })
  @IsEnum(CurrencyCode, { message: 'Invalid ISO currency code' })
  isoCurrencyCode: string;
}
