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
export class ManualAccountDTO {
  @IsString()
  accountName : string;

  @IsString()
  institutionName : string

  @IsString()
  accountId : string;

  @IsNotEmpty({ message: 'Current balance must not be empty' })
  @IsNumber({ allowNaN: false }, { message: 'Current balance must be a number' })
  @IsPositive({ message: 'Current balance must be a positive number' })
  currentBalance: number;

  @IsNotEmpty({ message: 'Available balance must not be empty' })
  @IsNumber({ allowNaN: false }, { message: 'Available balance must be a number' })
  @IsPositive({ message: 'Available balance must be a positive number' })
  availableBalance: number;

  @IsNotEmpty({ message: 'ISO currency code must not be empty' })
  @IsString({ message: 'ISO currency code must be a string' })
  @IsEnum(CurrencyCode, { message: 'Invalid ISO currency code' })
  isoCurrencyCode: string;
}
