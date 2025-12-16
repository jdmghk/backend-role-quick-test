import { IsNotEmpty, IsString, IsIn } from "class-validator";

export class CreateWalletDto {
    @IsNotEmpty()
    @IsString()
    @IsIn(['USD'])
    currency: 'USD';
}