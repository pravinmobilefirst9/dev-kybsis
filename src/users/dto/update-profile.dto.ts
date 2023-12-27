import { IsDate, IsIn, IsOptional, IsPhoneNumber, IsString } from "class-validator"
import { CountryCode } from 'libphonenumber-js';

export class UpdateProfileDto {
    @IsString({ message: 'First name must be a string' })
    firstname?: string;

    @IsString({ message: 'Last name must be a string' })
    lastname?: string;

    @IsDate({ message: 'Invalid date format for date of birth' })
    date_of_birth?: Date;

    @IsPhoneNumber("IN", { message: 'Invalid phone number format' }) // 'ZZ' allows any country code
    phone_number?: string;

    @IsString({ message: 'Gender must be a string' })
    @IsIn(['male', 'female', 'other'], { message: 'Invalid gender value' })
    gender?: string;
}


