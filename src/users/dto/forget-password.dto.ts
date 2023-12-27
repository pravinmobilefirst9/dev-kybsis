import { IsEmail } from "class-validator";

export class ForgetPassword {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email : string
}