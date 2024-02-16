import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';

export class FetchUserBanks {
  @IsNotEmpty({ message: 'manual must not be empty' })
  @IsBoolean({ message: 'manual must be a boolean' })
  manual: boolean;

}
