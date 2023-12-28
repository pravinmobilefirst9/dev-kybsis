import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDTO {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string;

  @IsString({ message: 'OTP must be a string' })
  @IsNotEmpty({ message: 'OTP cannot be empty' })
  otp: string;
}