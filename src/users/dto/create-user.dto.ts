import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class RegisterUserDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email: string;
  
    @IsNotEmpty({ message: 'Password cannot be empty' })
    password: string;
  
    @IsNotEmpty({ message: 'Device token cannot be empty' })
    @Transform(({ value }) => value.trim()) // Trim whitespace from the device token
    device_token: string;
}
