import { HttpException, HttpStatus } from '@nestjs/common';


export class BusinessLogicException extends HttpException {
    constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
        super(message, statusCode);
    }
}

export class WalletNotFoundException extends BusinessLogicException {
    constructor(walletId: string) {
        super(`Wallet with ID "${walletId}" not found.`, HttpStatus.NOT_FOUND);
    }
}

export class InsufficientBalanceException extends BusinessLogicException {
    constructor(walletId: string, required: number, current: number) {
        super(
            `Wallet ${walletId} has insufficient balance. Required: ${required}, Current: ${current}.`,
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class SelfTransferException extends BusinessLogicException {
    constructor() {
        super('Cannot transfer funds to the same wallet.', HttpStatus.BAD_REQUEST);
    }
}