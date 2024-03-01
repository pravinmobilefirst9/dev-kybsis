import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, IsPositive, IsInt, Min, Max, IsBoolean, IsArray, ValidateNested } from 'class-validator';

export class CreateManualInvestmentDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvestmentFormDataDTO)
  formFields : InvestmentFormDataDTO[];

  @IsNotEmpty({ message: 'Category ID is required' })
  @IsInt({ message: 'Category ID must be an integer' })
  categoryId: number;

  @IsNotEmpty({ message: 'Account ID is required' })
  @IsInt({ message: 'Account ID must be an integer' })
  accountId: number;

  @IsNotEmpty({ message: 'Item Id is required and must be a number greater than 0.' })
  @IsNumber({}, { message: 'Item Id must be a number.' })
  @IsPositive({ message: 'Item Id must be a positive number.' })
  item_id: number;
}
  
export class InvestmentFormDataDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  @IsInt()
  order_id: number;

  @IsNotEmpty()
  @IsBoolean()
  mandatory: boolean;

  @IsNotEmpty()
  @IsString()
  value: string;
}
