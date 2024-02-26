import { User } from "@prisma/client";

export class UserCreatedEventPayload {
    user : User;
    otp : number;

    constructor(user : User, otp : number){
        this.user = user;
        this.otp = otp;
    }
}