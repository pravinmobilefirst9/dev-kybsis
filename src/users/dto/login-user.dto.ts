import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class LoginUserDto {
    @IsString({message : "Only strings are allowed"})
    @IsNotEmpty({message : "Email should not be empty"})
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email : string

    @IsString({message : "Only strings are allowed"})
    @IsNotEmpty({message : "Password should not be empty"})
    password : string
}