import { Subscription, User } from "@prisma/client";

export class UserSubscriptionInvoicePayload {
    user : User;
    subscription : Subscription

    constructor(user : User, subscription : Subscription){
        this.user = user;
        this.subscription = subscription;
    }
}