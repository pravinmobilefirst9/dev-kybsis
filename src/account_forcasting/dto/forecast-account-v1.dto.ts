import { IsNumber, IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';
import { Compound } from '../account_forcasting.service';

enum ContributionPeriod {
  Monthly = 'monthly',
  Annually = 'annually',
}

class InvestmentDataDto {
  @IsNotEmpty({ message: 'Starting amount must be provided' })
  @IsNumber({}, { message: 'Starting amount must be a number' })
  startingAmount: number;

  @IsNotEmpty({ message: 'Investment length must be provided' })
  @IsNumber({}, { message: 'Investment length must be a number' })
  investLength: number;

  @IsNotEmpty({ message: 'Return rate must be provided' })
  @IsNumber({}, { message: 'Return rate must be a number' })
  returnRate: number;

  @ValidateNested()
  @IsNotEmpty({ message: 'Compound must be provided' })
  compound: Compound;

  @IsNotEmpty({ message: 'Contribution period must be provided' })
  @IsEnum(ContributionPeriod, { message: 'Contribution period must be either "monthly" or "annually"' })
  contributionPeriod: ContributionPeriod;

  @IsNotEmpty({ message: 'Contribution amount must be provided' })
  @IsNumber({}, { message: 'Contribution amount must be a number' })
  contributeAmount: number;
}

export { InvestmentDataDto };
