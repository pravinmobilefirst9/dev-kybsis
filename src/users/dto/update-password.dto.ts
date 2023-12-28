// src/dto/user.dto.ts

import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumber, IsString, Length, MinLength } from 'class-validator';

export class UpdatePasswordDTO {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string;

  @IsNumber({}, { message: 'User ID must be a number' })
  @IsNotEmpty({ message: 'User ID cannot be empty' })
  userId: number;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @Length(8, 20, { message: 'Password must be between 8 and 20 characters long' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  password: string;
}
