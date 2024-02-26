import { IsString, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class FetchUserBanks {
  @IsOptional()
  @IsBoolean({ message: 'manual must be a boolean' })
  manual: boolean;
}
