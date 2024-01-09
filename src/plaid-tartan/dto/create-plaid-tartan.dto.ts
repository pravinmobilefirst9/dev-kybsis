import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePlaidTartanDto {
  @IsString({ message: 'Plaid item ID must be a string' })
  @IsNotEmpty({ message: 'Plaid item ID cannot be empty' })
  plaid_item_id: string;

  @IsString({ message: 'Access token must be a string' })
  @IsNotEmpty({ message: 'Access token cannot be empty' })
  access_token: string;

  @IsString({ message: 'Institution id must be a string' })
  @IsNotEmpty({ message: 'Institution id cannot be empty' })
  institution_id: string;

  @IsString({ message: 'Institution name must be a string' })
  @IsNotEmpty({ message: 'Institution name cannot be empty' })
  institution_name: string;
}
