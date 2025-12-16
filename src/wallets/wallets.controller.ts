import {
    Controller,
    Post,
    Body,
    Param,
    Patch,
    Get,
    HttpCode,
    HttpStatus,
    Headers, // For Idempotency-Key
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferFundsDto } from './dto/transfer-funds.dto';
import { SelfTransferException } from '../common/errors';
import { TransactionsService } from '../transactions/transactions.service';

@Controller('wallets')
export class WalletsController {
    constructor(
        private readonly walletsService: WalletsService,
        private readonly transactionsService: TransactionsService,
    ) { }

    // 1. Create Wallet
    @Post()
    create(@Body() createWalletDto: CreateWalletDto) {
        return this.walletsService.createWallet(createWalletDto.currency);
    }

    // 2. Fund Wallet
    @Patch(':id/fund')
    @HttpCode(HttpStatus.OK)
    fund(
        @Param('id') id: string,
        @Body() fundWalletDto: FundWalletDto,
        @Headers('idempotency-key') idempotencyKey?: string,
    ) {
        return this.walletsService.fundWallet(
            id,
            fundWalletDto.amount,
            idempotencyKey,
        );
    }

    // 3. Transfer Between Wallets
    @Post(':id/transfer')
    @HttpCode(HttpStatus.OK)
    transfer(
        @Param('id') senderId: string,
        @Body() transferFundsDto: TransferFundsDto,
        @Headers('idempotency-key') idempotencyKey?: string,
    ) {
        const { receiverId, amount } = transferFundsDto;

        if (senderId === receiverId) {
            throw new SelfTransferException();
        }

        return this.walletsService.transferFunds(
            senderId,
            receiverId,
            amount,
            idempotencyKey,
        );
    }

    // 4. Fetch Wallet Details (includes history)
    @Get(':id')
    getDetails(@Param('id') id: string) {
        const wallet = this.walletsService.findWalletById(id);
        const history = this.transactionsService.findWalletTransactions(id);

        return {
            wallet,
            transactionHistory: history,
        };
    }
}