import {
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';

export enum Duration {
  Monthly = 'Monthly',
  Annually = 'Annually',
}

export class CreateBudgetDto {
  @IsEnum(Duration, { message: 'Invalid duration. Must be Monthly or Annually.' })
  readonly duration: Duration;

  @IsString({ message: 'Name must be a string.' })
  @IsNotEmpty({ message: 'Name should not be empty.' })
  readonly name: string;

  @IsNumber({}, { message: 'Set limit must be a number.' })
  @IsNotEmpty({ message: 'Category should not be empty.' })
  readonly categoryId: number;

  @IsNumber({}, { message: 'Amount must be a number.' })
  readonly amount: number;

  @IsNotEmpty({ message: 'Date should not be empty' })
  readonly startDate: Date;

  @IsOptional()
  @IsEmail({}, { each: true, message: 'Invalid email address in collaborators.' })
  readonly collaborators?: string[];
}
