import {
    IsEnum,
    IsString,
    IsNumber,
    IsDate,
    IsOptional,
    IsArray,
    IsNotEmpty,
    isNotEmpty,
  } from 'class-validator';
  
  export enum Duration  {
    Monthly = 'Monthly',
    Annually = 'Annually',
  }
  
  export class CreateBudgetDto {
    @IsEnum(Duration, { message: 'Invalid duration. Must be Monthly or Annually.' })
    readonly duration: Duration;
  
    @IsString({ message: 'Name must be a string.' })
    @IsNotEmpty({ message: 'Name should not be empty.' })
    readonly name: string;
  
    @IsString({ message: 'Category must be a string.' })
    @IsNotEmpty({ message: 'Category should not be empty.' })
    readonly category: string;
  
    @IsString({ message: 'Account must be a string.' })
    @IsNotEmpty({ message: 'Account should not be empty.' })
    readonly account: string;
  
    @IsNumber({}, { message: 'Amount must be a number.' })
    readonly amount: number;
  
    @IsNotEmpty({ message: 'Invalid start date.' })
    readonly startDate: Date;
  
    @IsOptional()
    @IsNumber({}, { message: 'Set limit must be a number.' })
    readonly setLimit?: number; // Optional set limit field
  
    @IsOptional()
   
    readonly collaborators?: string[];
  }
  