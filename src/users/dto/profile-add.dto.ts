import { IsDate, IsIn, IsNotEmpty, IsPhoneNumber, IsString, Matches } from "class-validator";

export class ProfileAddDto {
  @IsNotEmpty({ message: 'First name cannot be empty' })
  @IsString({ message: 'First name must be a string' })
  firstname: string;

  @IsNotEmpty({ message: 'Last name cannot be empty' })
  @IsString({ message: 'Last name must be a string' })
  lastname: string;

  @IsNotEmpty({ message: 'Date of birth cannot be empty' })
  // @IsDate({ message: 'Invalid date format for date of birth' })
  date_of_birth: Date;

  @IsNotEmpty({ message: 'Phone number cannot be empty' })
  @IsString({ message: 'Date of birth must be a string' })
  @Matches(/^\+1\s?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, {message : "Invalid number"}  )
  phone_number: string;

  @IsNotEmpty({ message: 'Gender cannot be empty' })
  @IsString({ message: 'Gender must be a string' })
  // @IsIn(['male', 'female', 'other'], { message: 'Invalid gender value' })
  gender: string;

  @IsNotEmpty({ message: 'ZIP code cannot be empty' })
  @Matches(/^[0-9]{5}(?:-[0-9]{4})?$/, { message: 'Invalid ZIP code format' })
  zipcode: string;
}


