import { IsNotEmpty, IsNumber } from "class-validator";

export class CollaboratrTransactions {
    @IsNumber({}, { message: 'Budget id must be a number.' })
    @IsNotEmpty({ message: 'Budget id should not be empty.' })
    readonly budgetId : number;

    @IsNumber({}, { message: 'Collaborator Id must be a number.' })
    @IsNotEmpty({ message: 'Collaboratr Id should not be empty.' })
    readonly collaboratorId : number;
}