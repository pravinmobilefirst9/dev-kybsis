import { ClassTransformer, Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Length, Matches, MinLength } from "class-validator";

export class RegisterUserDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'email cannot be empty' })
    email: string;

    @IsNotEmpty({ message: 'Password cannot be empty' })
    @IsString({ message: 'Password must be a string' })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
        message: 'Password must contain at least 8 characters, one letter, one number, and one special character.',
      })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    password: string;

    @IsNotEmpty({ message: 'Device token cannot be empty' })
    @Transform(({ value }) => value.trim()) // Trim whitespace from the device token
    device_token: string;
}
