import { ClassTransformer, Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from "class-validator";

export class RegisterUserDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'email cannot be empty' })
    email: string;

    @IsNotEmpty({ message: 'Password cannot be empty' })
    @IsString({ message: 'Password must be a string' })
    @Length(8, 20, { message: 'Password must be between 8 and 20 characters long' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    password: string;

    @IsNotEmpty({ message: 'Device token cannot be empty' })
    @Transform(({ value }) => value.trim()) // Trim whitespace from the device token
    device_token: string;
}
