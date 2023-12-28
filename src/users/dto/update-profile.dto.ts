import { IsDate, IsIn, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator"
import { CountryCode } from 'libphonenumber-js';

export class UpdateProfileDto {
    @IsString({ message: 'First name must be a string' })
    @IsNotEmpty({ message: 'Firstname cannot be empty' })
    firstname: string;

    @IsString({ message: 'Last name must be a string' })
    @IsNotEmpty({ message: 'Lastname cannot be empty' })
    lastname: string;

    // @IsDate({ message: 'Invalid date format for date of birth' })
    @IsNotEmpty({ message: 'Email cannot be empty' })
    @IsString({ message: 'Date of birth must be a string' })
    date_of_birth: Date;

    @IsPhoneNumber("IN", { message: 'Invalid phone number format' }) // 'ZZ' allows any country code
    @IsNotEmpty({ message: 'Phone number cannot be empty' })
    phone_number: string;

    @IsString({ message: 'Gender must be a string' })
    // @IsIn(['male', 'female', 'other'], { message: 'Invalid gender value' })
    @IsNotEmpty({ message: 'Gender cannot be empty' })
    gender: string;
}


