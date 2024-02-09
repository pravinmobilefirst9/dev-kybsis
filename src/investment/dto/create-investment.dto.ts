import { IsNotEmpty, IsString, IsNumber, IsPositive, IsInt, Min, Max } from 'class-validator';

export class CreateManualInvestmentDto {
    @IsNotEmpty({ message: 'Name cannot be empty' })
    @IsString({ message: 'Name must be a string' })
    name: string;
  
    @IsNotEmpty({ message: 'Currency cannot be empty' })
    @IsString({ message: 'Currency must be a string' })
    currency: string;
  
    @IsNotEmpty({ message: 'Price cannot be empty' })
    @Min(0, { message: 'Price must be greater than or equal to 0' })
    @Max(1000000, {message : "Price must be less than or equal to 1 Million"})
    purchasePrice: number;
    
    @IsNotEmpty({ message: 'current price cannot be empty' })
    @Min(0, { message: 'current price must be greater than or equal to 0' })
    @Max(1000000, {message : "Price must be less than or equal to 1 Million"})
    currentPrice: number;
  
    @IsNotEmpty({ message: 'Quantity cannot be empty' })
    @IsInt({ message: 'Quantity must be an integer' })
    @Min(0, { message: 'Quantity must be greater than or equal to 0' })
    quantity: number;
  
    @IsNotEmpty({ message: 'Category ID cannot be empty' })
    @IsInt({ message: 'Category ID must be an integer' })
    categoryId: number;
  }
  