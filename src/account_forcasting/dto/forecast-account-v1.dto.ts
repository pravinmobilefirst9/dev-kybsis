import { IsNotEmpty, IsNumber, IsIn } from 'class-validator';

enum ContributionFrequency {
  Monthly = 'monthly',
  Annually = 'annually',
}

enum ContributionTiming {
  Beginning = 'beginning',
  End = 'end',
}

class InvestmentQueryDto {
  @IsNotEmpty({ message: 'Starting amount must be provided' })
  @IsNumber({},{ message: 'Starting amount must be a number' })
  startingAmount: number;

  @IsNotEmpty({ message: 'Return rate must be provided' })
  @IsNumber({},{ message: 'Return rate must be a number' })
  returnRate: number;

  @IsNotEmpty({ message: 'Investment length must be provided' })
  @IsNumber({},{ message: 'Investment length must be a number' })
  investmentLength: number;

  @IsNotEmpty({ message: 'Additional contribution must be provided' })
  @IsNumber({},{ message: 'Additional contribution must be a number' })
  additionalContribution: number;

  @IsNotEmpty({ message: 'Contribution frequency must be provided' })
  @IsIn(Object.values(ContributionFrequency), { message: 'Contribution frequency must be either "monthly" or "annually"' })
  contributionFrequency: ContributionFrequency;

  @IsNotEmpty({ message: 'Contribution timing must be provided' })
  @IsIn(Object.values(ContributionTiming), { message: 'Contribution timing must be either "beginning" or "end"' })
  contributionTiming: ContributionTiming;
}

export { InvestmentQueryDto };
