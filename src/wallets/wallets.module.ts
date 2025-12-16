import { Module } from '@nestjs/common';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import { TransactionsModule } from '../transactions/transactions.module'

@Module({
  imports: [TransactionsModule],
  controllers: [WalletsController],
  providers: [WalletsService]
})
export class WalletsModule { }
