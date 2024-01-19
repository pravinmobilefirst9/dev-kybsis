import { IsEmpty, IsEnum, IsNotEmpty, IsNumber } from "class-validator";

export enum CollaborationStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
  }
  
export class InvitationStatusUpdateDTO {
    @IsEnum(CollaborationStatus, {
        message: `Invalid collaboration invitation status. It should be one of: ${Object.values(CollaborationStatus).join(', ')}`,
    })
    status: CollaborationStatus;


    @IsNumber({}, { message: 'Request ID must be a valid number.' })
    @IsNotEmpty({ message: 'Request ID cannot be empty.' })
    requestId: number;
}