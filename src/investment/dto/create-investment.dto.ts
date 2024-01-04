import { IsNotEmpty, IsString, IsNumber, IsPositive, IsInt, Min } from 'class-validator';

export class CreateManualInvestmentDto {
    @IsNotEmpty({ message: 'Name cannot be empty' })
    @IsString({ message: 'Name must be a string' })
    name: string;
  
    @IsNotEmpty({ message: 'Amount cannot be empty' })
    @IsNumber({}, { message: 'Amount must be a number' })
    @IsPositive({ message: 'Amount must be a positive number' })
    amount: number;
  
    @IsNotEmpty({ message: 'Currency cannot be empty' })
    @IsString({ message: 'Currency must be a string' })
    currency: string;
  
    @IsNotEmpty({ message: 'Price cannot be empty' })
    @IsInt({ message: 'Price must be an integer' })
    @Min(0, { message: 'Price must be greater than or equal to 0' })
    price: number;
  
    @IsNotEmpty({ message: 'Quantity cannot be empty' })
    @IsInt({ message: 'Quantity must be an integer' })
    @Min(0, { message: 'Quantity must be greater than or equal to 0' })
    quantity: number;
  
    @IsNotEmpty({ message: 'Category ID cannot be empty' })
    @IsInt({ message: 'Category ID must be an integer' })
    categoryId: number;
  }
  