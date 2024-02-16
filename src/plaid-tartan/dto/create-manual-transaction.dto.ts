import { IsInt, IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsDate, IsPositive } from 'class-validator';
import { IsDateFormat } from 'src/budget/dto/create-budget.dto';

export class CreateTransactionDto {
  @IsInt({ message: 'Account ID must be an integer' })
  @IsNotEmpty({ message: 'Account ID is required' })
  account_id: number;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsNotEmpty({ message: 'Amount is required' })
  @IsPositive({ message: 'Amount must be a positive number' })
  amount : number;

  @IsInt({ message: 'Category ID must be number' })
  @IsNotEmpty({ message: 'Category id is required' })
  category_id : number;

  @IsNotEmpty({ message: 'Date should not be empty' })
  @IsString({ message: 'Date must be a string' })
  date : string;

  @IsBoolean({ message: 'Pending must be a boolean value'})
  @IsOptional()
  pending : boolean;
}
