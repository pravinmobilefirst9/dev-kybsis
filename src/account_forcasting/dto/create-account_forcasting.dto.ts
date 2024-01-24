import { IsEnum, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export enum CompoundFrequency {
  ANNUALLY = 'ANNUALLY',
  SEMIANNUALLY = 'SEMIANNUALLY',
  QUARTERLY = 'QUARTERLY',
  MONTHLY = 'MONTHLY',
  SEMIMONTHLY = 'SEMIMONTHLY',
  BIWEEKLY = 'BIWEEKLY',
  WEEKLY = 'WEEKLY',
  DAILY = 'DAILY',
  CONTINUOUSLY = 'CONTINUOUSLY',
}

export enum Timing {
  BEGINNING = 'BEGINNING',
  END_OF_EACH_MONTH = 'END_OF_EACH_MONTH',
  END_OF_EACH_YEAR = 'END_OF_EACH_YEAR',
}

export class CreateAccountForcastingDto {
  @IsOptional()
  @IsNumber({}, { message: 'Id must be a number' })
  forcastingId: number;

  @IsNumber({}, { message: 'Starting amount must be a number' })
  @IsPositive({ message: 'Starting amount must be a positive number' })
  startingAmount: number;

  @IsNumber({}, { message: 'Time period must be a number' })
  @Min(1, { message: 'Time period must be at least 1' })
  timePeriod: number;

  @IsNumber({}, { message: 'Return rate must be a number' })
  @Min(0, { message: 'Return rate cannot be negative' })
  returnRate: number;

  @IsEnum(CompoundFrequency, { message: 'Invalid compound frequency' })
  compound: CompoundFrequency;

  @IsEnum(Timing, { message: 'Invalid contribution timing' })
  contributeAt: Timing;
}

