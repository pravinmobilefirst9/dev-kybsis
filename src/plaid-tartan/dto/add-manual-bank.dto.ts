import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';

export class AddBankDTO {
  @IsNotEmpty({ message: 'ins_id must not be empty' })
  @IsString({ message: 'ins_id must be a string' })
  ins_id: string;

  @IsNotEmpty({ message: 'ins_name must not be empty' })
  @IsString({ message: 'ins_name must be a string' })
  ins_name: string;
}
