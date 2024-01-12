import { PartialType } from '@nestjs/mapped-types';
import { CreateBudgetDto } from './create-budget.dto';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {
  @IsNumber({}, { message: 'Id must be a number.' })
  @IsNotEmpty({ message: 'Id should not be empty.' })
  readonly id: number;
}
