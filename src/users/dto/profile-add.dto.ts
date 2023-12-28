import { IsDate, IsIn, IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";

export class ProfileAddDto {
  @IsNotEmpty({ message: 'First name cannot be empty' })
  @IsString({ message: 'First name must be a string' })
  firstname: string;

  @IsNotEmpty({ message: 'Last name cannot be empty' })
  @IsString({ message: 'Last name must be a string' })
  lastname: string;

  @IsNotEmpty({ message: 'Date of birth cannot be empty' })
  @IsDate({ message: 'Invalid date format for date of birth' })
  date_of_birth: Date;

  @IsPhoneNumber("IN", { message: 'Invalid phone number format' }) // 'ZZ' allows any country code
  @IsNotEmpty({ message: 'Phone number cannot be empty' })
  phone_number: string;

  @IsNotEmpty({ message: 'Gender cannot be empty' })
  @IsString({ message: 'Gender must be a string' })
  @IsIn(['male', 'female', 'other'], { message: 'Invalid gender value' })
  gender: string;
}


