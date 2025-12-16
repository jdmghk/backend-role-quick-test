import { IsNumber, IsPositive, IsUUID } from "class-validator";

export class TransferFundsDto {
    @IsNumber()
    @IsPositive()
    amount: number;
    @IsUUID('4', { message: 'Receiver ID must be a valid UUID' })
    receiverId: string;
}