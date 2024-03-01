// investment-details.dto.ts

import { IsNotEmpty, IsNumber, IsPositive, IsString, IsEnum, IsArray, ArrayNotEmpty, ArrayMinSize } from 'class-validator';

enum CompoundingFrequency {
  annually = 'annually',
  semiannually = 'semiannually',
  quarterly = 'quarterly',
  monthly = 'monthly',
  biweekly = 'biweekly',
  weekly = 'weekly',
  daily = 'daily',
  continuously = 'continuously'
}

enum ContributionsPerYear {
  endOfYear = 'endOfYear',
  endOfMonth = 'endOfMonth',
  startOfYear = 'startOfYear',
  startOfMonth = 'startOfMonth'
}


export class InvestmentDetailsDto {
  @IsNotEmpty({ message: 'Principal amount is required and must be a number greater than 0.' })
  @IsNumber({}, { message: 'Principal amount must be a number.' })
  @IsPositive({ message: 'Principal amount must be a positive number.' })
  principal: number;

  @IsNotEmpty({ message: 'Annual interest rate is required and must be a number greater than 0.' })
  @IsNumber({}, { message: 'Annual interest rate must be a number.' })
  @IsPositive({ message: 'Annual interest rate must be a positive number.' })
  annualInterestRate: number;

  @IsNotEmpty({ message: 'Number of years is required and must be a number greater than 0.' })
  @IsNumber({}, { message: 'Number of years must be a number.' })
  @IsPositive({ message: 'Number of years must be a positive number.' })
  years: number;

  @IsNotEmpty({ message: 'Contribution amount is required and must be a number greater than 0.' })
  @IsNumber({}, { message: 'Contribution amount must be a number.' })
  @IsPositive({ message: 'Contribution amount must be a positive number.' })
  contribution: number;

  @IsNotEmpty({ message: 'Contribution frequency is required and must be one of: endOfYear, endOfMonth, startOfYear, startOfMonth.' })
  @IsString({ message: 'Contribution frequency must be a string.' })
  @IsEnum(ContributionsPerYear, { message: 'Contribution frequency must be one of: endOfYear, endOfMonth, startOfYear, startOfMonth.' })
  contributionFrequency: string;

  @IsNotEmpty({ message: 'Compounding frequency is required and must be one of: daily, weekly, monthly, quarterly, semi-annually, annually, continuously.' })
  @IsString({ message: 'Compounding frequency must be a string.' })
  @IsEnum(CompoundingFrequency, { message: 'Compounding frequency must be one of: daily, weekly, monthly, quarterly, semi-annually, annually, continuously.' })
  compoundingFrequency: string;

  @IsArray({ message: 'Account IDs must be provided as an array.' })
  @ArrayNotEmpty({ message: 'Account IDs array must not be empty.' })
  @ArrayMinSize(1, { message: 'At least one account ID must be provided.' })
  @IsNumber({}, { each: true, message: 'Each account ID must be a number.' })
  accountIds: number[];

  @IsNotEmpty({ message: 'Item Id is required and must be a number greater than 0.' })
  @IsNumber({}, { message: 'Item Id must be a number.' })
  @IsPositive({ message: 'Item Id must be a positive number.' })
  item_id: number;

}
